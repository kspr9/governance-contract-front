<script lang="ts">
  /**
   * Cap Table Component
   * Shows share ownership breakdown, eligible claimants, and treasury shares
   */
  
  import { shareLedgerStore } from '../stores/shareLedgerStore.svelte';
  import { tzktStorageData } from '../stores/tzktStorage.svelte';
  import { contractState } from '../stores/contractStore.svelte';
  import LoadingDots from './LoadingDots.svelte';
  import { terminology } from '../utils/terminology';
  import HelpTip from './HelpTip.svelte';
  import CollapsibleSection from './shared/CollapsibleSection.svelte';
  import { contractInstance } from '../stores/contractStore.svelte';
  
  let { 
    maxSharesCache,
    maxSharesLoading,
    shareholderNameCache,
    handleLoadContract
  }: {
    maxSharesCache: Record<string, { max_shares: number, issued_shares?: number, registry_number?: string }>;
    maxSharesLoading: Record<string, boolean>;
    shareholderNameCache: Record<string, { name?: string; loading: boolean; error?: string }>;
    handleLoadContract: (address: string) => Promise<void>;
  } = $props();
  
  let { state: shareLedgerState } = shareLedgerStore;
  
  let sortedShareLedgerEntries = $derived([...shareLedgerState.shareLedger].sort((a, b) => Number(b[1]) - Number(a[1])));
  
  // Collapsible state
  let showLedger = $state(true);
  let showUnclaimed = $state(false);
  let showClaimants = $state(false);
  let showDistributeForm = $state(false);

  let destinationAddress = $state('');
  let loadingAddress = $state<string | null>(null);
  let error = $state<string | null>(null);
  let hasEligibleClaimants = $derived(shareLedgerState.eligibleClaimants.length > 0);
  //let eligibleClaimants = $derived(() => hasEligibleClaimants);

  // Debug effect to log the state
  $effect(() => {
    
  });

  // Refactored: Accept address as argument
  /**
   * Distributes shares to the given address by calling the contract entrypoint.
   * Shows loading, error, and success states.
   */
  async function handleClaimSharesDirect(address: string) {
    if (!hasEligibleClaimants) return;
    loadingAddress = address;
    error = null;
    try {
      const { resetProvider } = await import('../config/beaconConfig');
      const { toastStore } = await import('../stores/toastStore.svelte');
      await resetProvider();
      const contract = $contractInstance;
      if (!contract) throw new Error('Contract instance not found');
      console.log('ContractState.address:', $contractState.contractAddress);
      console.log('ContractInstance:', contract);
      console.log('Address param:', address);
      console.log('Param object:', { destination_address: address });
      const operation = await contract.methods.claim_shares_direct(address).send();
      const result = await operation.confirmation(2);
      await handleLoadContract($contractState.contractAddress || '');
      toastStore.add('success', 'Direct claim of shares successful', result.hash);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to claim shares directly';
    } finally {
      loadingAddress = null;
    }
  }
</script>

<div class="space-y-4 mb-8">
  <!-- Share Ledger / Cap Table -->
  <CollapsibleSection title="{terminology.SHARE_LEDGER}" tooltip="{terminology.HELP_SHARE_REGISTER}" bind:open={showLedger}>
    <table class="cap-table">
      <colgroup>
        <col style="width: 25%;" />
        <col style="width: 15%;" />
        <col style="width: 35%;" />
        <col style="width: 25%;" />
      </colgroup>
      <thead>
        <tr>
          <th>NAME</th>
          <th>{terminology.REGISTRY_NUMBER}</th>
          <th>WALLET ADDRESS</th>
          <th>OWNED SHARES</th>
        </tr>
      </thead>
      <tbody>
        {#if shareLedgerState.loading}
          <tr>
            <td class="text-center p-4" colspan="4">
              <LoadingDots />
            </td>
          </tr>
        {:else if sortedShareLedgerEntries.length > 0}
          {#each sortedShareLedgerEntries as [address, claimedShares], i}
            {@const registryNumber = maxSharesCache[address]?.registry_number}
            {@const nameInfo = registryNumber ? shareholderNameCache[registryNumber] : undefined}
            <tr>
              <td>
                {#if maxSharesLoading[address]}
                  <LoadingDots />
                {:else if registryNumber}
                  {#if registryNumber.length === 8}
                    {#if nameInfo?.loading}
                      <LoadingDots />
                    {:else if nameInfo?.name}
                      {nameInfo.name}
                    {:else if nameInfo?.error}
                      <span class="text-[color:var(--destructive)]" title={nameInfo.error}>Error</span>
                    {:else}
                      -
                    {/if}
                  {:else}
                    Private person
                  {/if}
                {:else}
                  -
                {/if}
              </td>
              <td>
                {#if maxSharesLoading[address]}
                  <LoadingDots />
                {:else if registryNumber}
                  {registryNumber}
                {:else}
                  -
                {/if}
              </td>
              <td>
                {#if address.startsWith("KT1")}
                  <button 
                    class="wallet-link"
                    onclick={() => {
                      $contractState.contractAddress = address;
                      handleLoadContract(address);
                    }}
                  >
                    {address}
                  </button>
                {:else}
                  <span class="wallet-address">{address}</span>
                {/if}
              </td>
              <td class="shares-cell">
                <span class="shares-count">{claimedShares}</span>
                {#if tzktStorageData.max_shares && Number(tzktStorageData.max_shares) > 0}
                  <span class="shares-percentage">
                    ({( (Number(claimedShares) / Number(tzktStorageData.max_shares)) * 100 ).toFixed(2)}%)
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td class="text-center p-2 text-muted" colspan="4">No share ledger entries</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </CollapsibleSection>

  <!-- Treasury Shares Card -->
  <CollapsibleSection title="{terminology.TREASURY_SHARES}" tooltip="Shares that have been created but not yet allocated to shareholders" bind:open={showUnclaimed}>
    <table class="w-full border-collapse text-sm table-fixed">
      <thead>
        <tr class="table-header">
          <th class="text-left p-2">Issuer</th>
          <th class="text-right p-2">Amount</th>
        </tr>
      </thead>
      <tbody>
        {#if shareLedgerState.unclaimedSharePool.length > 0}
          {#each shareLedgerState.unclaimedSharePool as [_, ticket]}
            <tr class="table-row">
              <td class="text-left p-2">{ticket.address}</td>
              <td class="text-right p-2">{ticket.amount}</td>
            </tr>
          {/each}
        {:else}
          <tr class="table-row">
            <td class="text-center p-2 text-muted" colspan="2">No unallocated shares</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </CollapsibleSection>

  <!-- Eligible Claimants Card -->
  <CollapsibleSection title="{terminology.ELIGIBLE_CLAIMANTS}" tooltip="Shareholders who have been allocated shares but haven't claimed them yet" bind:open={showClaimants}>
    <table class="w-full border-collapse text-sm table-fixed">
      <colgroup>
        <col style="width: 70%;" />
        <col style="width: 30%;" />
      </colgroup>
      <thead>
        <tr class="table-header">
          <th class="text-left p-2">Address</th>
          <th class="text-center p-2">Entitled Shares</th>
        </tr>
      </thead>
      <tbody>
        {#if shareLedgerState.eligibleClaimants.length > 0}
          {#each shareLedgerState.eligibleClaimants as [address, shares]}
            <tr class="table-row">
              <td class="font-mono p-2">
                {#if address.startsWith('KT1')}
                  <button 
                    class="text-primary hover:text-[color:var(--accent)] hover:underline text-left"
                    onclick={() => {
                      $contractState.contractAddress = address;
                      handleLoadContract(address);
                    }}
                  >
                    {address}
                  </button>
                {:else}
                  {address}
                {/if}
              </td>
              <td class="text-right p-2">
                <div class="flex items-center justify-end gap-2">
                  <span>{shares}</span>
                  <button
                    class="btn-sm"
                    disabled={loadingAddress === address}
                    onclick={() => handleClaimSharesDirect(address)}
                    title="Distribute shares to this address"
                  >
                    {#if loadingAddress === address}
                      Sending <LoadingDots />
                    {:else}
                      Distribute Shares
                    {/if}
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        {:else}
          <tr class="table-row">
            <td class="text-center p-2 text-muted" colspan="3">No pending allocations</td>
          </tr>
        {/if}
      </tbody>
    </table>
    {#if error}
      <div class="text-[color:var(--destructive)] mt-2">{error}</div>
    {/if}
  </CollapsibleSection>
</div>

<style>
  .cap-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
    font-family: var(--font-family);
  }

  .cap-table thead tr {
    background-color: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  .cap-table th {
    text-transform: uppercase;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--muted-foreground);
    text-align: left;
    padding: var(--space-3) var(--space-4);
    letter-spacing: 0.1em;
  }

  .cap-table th:last-child {
    text-align: right;
  }

  .cap-table tbody tr {
    background-color: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .cap-table tbody tr:last-child {
    border-bottom: none;
  }

  .cap-table td {
    padding: var(--space-3) var(--space-4);
    color: var(--foreground);
    font-size: var(--text-sm);
  }

  .cap-table td:last-child {
    text-align: right;
  }

  .wallet-link {
    color: var(--primary);
    text-decoration: none;
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    padding: 0;
    margin: 0;
  }

  .wallet-link:hover {
    color: var(--accent);
  }

  .wallet-address {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--foreground);
  }

  .shares-cell {
    text-align: right;
  }

  .shares-count {
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .shares-percentage {
    color: var(--color-text-muted);
    margin-left: var(--space-2);
  }
</style>
