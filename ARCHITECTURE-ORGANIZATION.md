### Goal
Separate blockchain/data logic from Svelte components, keep current behavior, and make the codebase clearer and more maintainable.

### What you have today (hotspots)
- `ContractLoader.svelte`
  - Exports `handleLoadContract`, orchestrates TzKT fetch, sets multiple stores, resets wallet provider, creates `contractInstance`, and fetches Estonian registry data.
- `CreateCompany.svelte`
  - Handles governance entrypoint, confirmation, and reloads governance storage.
- Many components call low-level wallet ops directly:
  - `resetProvider`, `Tezos.wallet.at`, `contractInstance.set` sprinkled in `ContractLoader.svelte`, `ContractOps*.svelte`, `OwnedShareWallet.svelte`, `CapTable.svelte`, forms, etc.
- Data fetching split across:
  - `utils/contractLoader.ts`, `utils/governanceLoader.ts`, `stores/estonianRegistryCache.svelte.ts`.

This mixes UI, orchestration, and side-effects, causing duplication and mental overhead.

### Proposed organization (no logic changes, just structure)
- Keep stores as-is (they’re good):
  - `stores/contractStore.svelte.ts`, `stores/shareLedgerStore.svelte.ts`, `stores/tzktStorage.svelte.ts`, `stores/estonianRegistryCache.svelte.ts`, `stores/beaconStore.svelte.ts`, `stores/toastStore.svelte.ts`, `stores/uiStore.ts`
- Introduce three clear layers:

1) API clients (pure IO, no app state)
- `src/lib/api/tzktClient.ts`
  - `getContractStorage(address: string): Promise<TzktStorageData>`
- `src/lib/api/beaconClient.ts`
  - `resetProvider()`, `getWalletContract(address: string)`
- `src/lib/api/ebrClient.ts`
  - thin wrapper used by `estonianRegistryCache` if you want to unify; optional now

2) Services (domain-specific operations, still stateless)
- `src/lib/services/contractService.ts`
  - `fetchAndMapContractEntries(address: string)` → calls tzktClient, returns the entries object currently returned by `loadContractTzkt`
- `src/lib/services/governanceService.ts`
  - `createCompanyWallet({ admin, shares, companyID })` → sends op, waits for confirmation, returns tx hash
- `src/lib/services/walletService.ts`
  - `connectContract(address: string)` → `resetProvider` + `Tezos.wallet.at(address)`
- `src/lib/services/ebrService.ts` (optional)
  - If you want to move registry logic out of components and decouple from cache store later

3) Facades (the only things components call)
- `src/lib/features/contract/contractFacade.ts`
  - `load(address: string)` 1:1 with current `handleLoadContract`, but outside component:
    - set `contractState.contractAddress`
    - call `contractService.fetchAndMapContractEntries`
    - update `shareLedgerStore`, set `contractState.isLoaded`
    - `walletService.connectContract` → `contractInstance.set`
    - trigger company data fetch via `estonianRegistryCache.getCompanyData` if registry number exists
  - `claimShares(address: string)` and other entrypoints (currently in components/forms/utilities)
- `src/lib/features/governance/governanceFacade.ts`
  - `createCompanyWallet(...)` 1:1 with current code + `loadGovernanceContractTzkt` refresh

### Component guidelines after this split
- Components become thin and declarative:
  - UI state (local toggles, `#snippet`, `$effect` for view concerns)
  - Read from stores to render
  - Call facade methods for actions
- Examples:
  - `LoadContractForm.svelte`:
    ```svelte
    <script lang="ts">
      import { contractFacade } from /features/contract/contractFacade;
      function handleSubmit(address: string) {
        contractFacade.load(address);
      }
    </script>
    ```
  - `ContractLoader.svelte`:
    - Remove exported `handleLoadContract`; import and call `contractFacade.load` when needed
    - Keep view-only `$effect` (like sorting, toggles). If an effect fetches data, call facade/service, not `fetch` directly
  - `CreateCompany.svelte`:
    ```ts
    import { governanceFacade } from /features/governance/governanceFacade;
    await governanceFacade.createCompanyWallet({ admin, shares, companyID });
    ```
  - Forms and ops:
    - Replace repeated `resetProvider`/`Tezos.wallet.at` with `walletService` or `contractFacade` action methods

### Minimal API sketch (for alignment)
- `src/lib/features/contract/contractFacade.ts`
  ```ts
  export const contractFacade = {
    async load(address: string) { /* orchestrate stores + wallet + registry */ },
    async claimShares(params) { /* uses walletService + contractInstance */ },
    async transferHeldShares(params) { /* move from utils/contractActions */ },
    // ...other entrypoints used by forms/ops
  };
  ```
- `src/lib/services/contractService.ts`
  ```ts
  export async function fetchAndMapContractEntries(address: string) {
    const storage = await tzktClient.getContractStorage(address);
    return {
      eligibleClaimantsEntries: Object.entries(storage.eligible_claimants_map ?? {}),
      unclaimedSharePoolEntries: Object.entries(storage.unclaimed_share_pool ?? {}),
      heldExternalSharesEntries: Object.entries(storage.held_external_shares ?? {}),
      shareLedgerEntries: Object.entries(storage.share_ledger ?? {}),
      storage
    };
  }
  ```

### Incremental migration plan (low-risk)
1) Extract without changing call sites:
   - Create `contractFacade.load(address)` by moving the current logic from `ContractLoader.svelte` into the facade, keeping the exact sequence of operations and store updates.
   - Make `ContractLoader.svelte`’s exported `handleLoadContract` call `contractFacade.load(address)`. Nothing else changes yet.
2) Centralize wallet ops:
   - Add `walletService.connectContract(address)` and swap all direct `resetProvider`/`Tezos.wallet.at` calls in facade with it.
3) Consolidate actions:
   - Move `transferHeldShares`, `claimShares`, mint/allocate/admin changes into `contractFacade` methods, wire existing components/forms to call facade instead of utilities.
4) Update callers gradually:
   - Change components to import and call `contractFacade` directly (drop `bind:this` and instance methods).
5) Optionally move Estonian registry fetch trigger into facade:
   - Facade reads `tzktStorageData.registry_number` and calls `estonianRegistryCache.getCompanyData`.
6) Governance:
   - Factor `createCompanyWallet` into `governanceFacade`, and use it from `CreateCompany.svelte`.

### Naming and structure
- `src/lib/api`: IO-only modules
- `src/lib/services`: stateless domain operations (compose api)
- `src/lib/features/contract`: `contractFacade.ts`, `index.ts`
- `src/lib/features/governance`: `governanceFacade.ts`, `index.ts`
- Keep `stores` where they are, but consider grouping under `stores/` by feature if they grow

### Benefits
- One orchestration path for contract load and registry fetch
- No duplicated wallet setup code
- Components focus on rendering and simple handlers
- Easier testing: services/facades are pure TS and mockable

If you want, I can do Step 1 now (extract `handleLoadContract` to `contractFacade.load` and make the component delegate to it) with zero behavior change.
EOF
