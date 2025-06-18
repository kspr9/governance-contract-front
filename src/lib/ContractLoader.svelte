<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { contractState, contractInstance } from './stores/contractStore.svelte';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import ContractOps from "./ContractOps.svelte";
    import { loadContractTzkt } from './utils/contractLoader';
    import CreateCompany from "./CreateCompany.svelte";
    import { transferHeldShares } from './utils/contractActions';
    import { resetProvider } from './config/beaconConfig';
    import { toastStore } from './stores/toastStore.svelte';
    import Toast from './components/Toast.svelte';
    import LoadingDots from './components/LoadingDots.svelte';
    import { beaconState } from "./stores/beaconStore.svelte";
    
    
    // TODO: create two tabs under the 'Wallet Contract' section, where
    // First tab is 'Wallet' and the other 'Tokenization'
    // Wallet should have firstly a table of owned shares along with transfer and claim functions
    // and Tokenization tab should have 'Share ledger / current owners' table as well as Admin functions
    // something along the lines of lovable prototype structure. Or think of a better design.
    interface TzktTicket {
        data: string;
        amount: string;
        address: string;
    }

    let tzktEligibleClaimantsEntries = $state<[string, string][]>([]);
    let tzktUnclaimedSharePoolEntries = $state<[string, TzktTicket][]>([]);
    let tzktHeldExternalSharesEntries = $state<[string, TzktTicket][]>([]);
    let tzktShareLedgerEntries = $state<[string, string][]>([]);

    // Collapsible state
    let showLedger = $state(false);
    let showWallet = $state(false);
    let showUnclaimed = $state(false);
    let showClaimants = $state(false);

    function toggleLedger() { showLedger = !showLedger; }
    function toggleWallet() { showWallet = !showWallet; }
    function toggleUnclaimed() { showUnclaimed = !showUnclaimed; }
    function toggleClaimants() { showClaimants = !showClaimants; }

    // Add cache for max_shares per issuing contract
    let maxSharesCache = $state<Record<string, { max_shares: number, issued_shares?: number, registry_number?: string }>>({});
    let maxSharesLoading = $state<Record<string, boolean>>({});

    // Track which card's transfer form is open
    let openTransferCard = $state<string | null>(null);
    // Local state for transfer form per card
    let transferForms: Record<string, { destination: string; amount: string }> = {};

    // Add state for claim forms
    let userForms = $state({
        claimShares: { address: '' },
        claimSharesDirect: { destination_address: '' }
    });

    // Add loading states
    let loadingStates = $state({
        transfer: false,
        claimShares: false,
        claimSharesDirect: false
    });

    // Add error states
    let errorStates = $state({
        transfer: null as string | null,
        claimShares: null as string | null,
        claimSharesDirect: null as string | null
    });

    // Add state for admin operations collapse
    let showAdminOps = $state(false);
    function toggleAdminOps() { showAdminOps = !showAdminOps; }

    let contractInput = $state('');

    /**
     * Fetch and cache max_shares for a given issuing contract address
     */
    async function fetchMaxShares(issuingContract: string) {
        if (maxSharesCache[issuingContract] || maxSharesLoading[issuingContract]) return;
        maxSharesLoading[issuingContract] = true;
        try {
            const res = await fetch(`https://api.tzkt.io/v1/contracts/${issuingContract}/storage`);
            const data = await res.json();
            console.log('Fetched storage for', issuingContract, data);
            maxSharesCache[issuingContract] = {
                max_shares: data.max_shares,
                issued_shares: data.issued_shares,
                registry_number: data.registry_number
            };
            console.log('Cached max_shares:', maxSharesCache[issuingContract]);
        } catch (err) {
            console.error('Failed to fetch max_shares for', issuingContract, err);
        } finally {
            maxSharesLoading[issuingContract] = false;
        }
    }

    // On contract load, fetch max_shares for all unique issuing contracts in held_external_shares
    $effect(() => {
        const uniqueIssuers = new Set<string>();
        for (const [_, ticket] of tzktHeldExternalSharesEntries) {
            if (ticket && ticket.address) {
                uniqueIssuers.add(ticket.address);
            }
        }
        uniqueIssuers.forEach(addr => fetchMaxShares(addr));
    });



    /**
     * Test contracts
     * KT1SP3hazeQKE1Sk8MKaCED86GPGhyX2Jyu3
     * KT1SJjCTroZ3NgZJSqZp48EXWknGntFWVSKC
    */

    onMount(async () => {
        try {
            
        } catch (err) {
            console.error(err);

        }
    });

    export async function handleLoadContract(address: string) {
        $contractState.contractAddress = address;
        const entries = await loadContractTzkt();
        tzktEligibleClaimantsEntries = entries.eligibleClaimantsEntries;
        tzktUnclaimedSharePoolEntries = entries.unclaimedSharePoolEntries;
        tzktHeldExternalSharesEntries = entries.heldExternalSharesEntries;
        tzktShareLedgerEntries = entries.shareLedgerEntries;
        contractState.update(state => ({ ...state, isLoaded: true }));
        // Connect contract for wallet operations
        await resetProvider();
        if ($contractState.contractAddress && typeof $contractState.contractAddress === 'string') {
            const contract = await import('./config/beaconConfig').then(m => m.Tezos.wallet.at($contractState.contractAddress as string));
            contractInstance.set(contract);
        }
    }

    // Transfer logic (calls contractOps or similar)
    interface Ticket {
        data: string;
        amount: string;
        address: string;
    }

    async function handleTransfer(event: Event, ticket: Ticket) {
        event.preventDefault();
        const { destination, amount } = transferForms[ticket.address] || {};
        if (!destination || !amount) return;
        
        loadingStates.transfer = true;
        errorStates.transfer = null;
        
        try {
            const result = await transferHeldShares({
                amount,
                destination,
                share: ticket.address
            });
            
            toastStore.add('success', 'Shares transferred successfully', result);
            // Reset form and close
            transferForms[ticket.address] = { destination: '', amount: '' };
            openTransferCard = null;
            // After transfer, reload contract data
            await handleLoadContract($contractState.contractAddress || '');
        } catch (err) {
            console.error('Transfer failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to transfer shares';
            errorStates.transfer = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.transfer = false;
        }
    }

    async function handleClaimShares(event: Event) {
        event.preventDefault();
        loadingStates.claimShares = true;
        errorStates.claimShares = null;
        
        try {
            await resetProvider();
            const contract = $contractInstance;
            if (!contract) {
                throw new Error('Contract instance not found');
            }
            const operation = await contract.methodsObject.claim_shares(
                userForms.claimShares.address
            ).send();
            
            const result = await operation.confirmation(2);
            console.log("Shares claimed successfully");
            
            toastStore.add('success', 'Shares claimed successfully', result.hash);
            userForms.claimShares.address = '';
            await handleLoadContract($contractState.contractAddress || '');
        } catch (error) {
            console.error("Failed to claim shares:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to claim shares';
            errorStates.claimShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.claimShares = false;
        }
    }

    async function handleClaimSharesDirect(event: Event) {
        event.preventDefault();
        loadingStates.claimSharesDirect = true;
        errorStates.claimSharesDirect = null;
        
        try {
            await resetProvider();
            const contract = $contractInstance;
            if (!contract) {
                throw new Error('Contract instance not found');
            }
            const operation = await contract.methodsObject.claim_shares_direct(
                userForms.claimSharesDirect.destination_address
            ).send();
            
            const result = await operation.confirmation(2);
            console.log("Direct claim of shares successful");
            
            toastStore.add('success', 'Direct claim of shares successful', result.hash);
            userForms.claimSharesDirect.destination_address = '';
            await handleLoadContract($contractState.contractAddress || '');
        } catch (error) {
            console.error("Failed to claim shares directly:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to claim shares directly';
            errorStates.claimSharesDirect = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.claimSharesDirect = false;
        }
    }

</script>

<div class="space-y-6">
    <Toast />
    <!-- Contract Loading Card -->
    <div class="bg-[color:var(--card)] border border-[color:var(--border)] rounded-sm shadow p-4">
        <div class="font-semibold text-lg mb-2 text-[color:var(--primary)]">Load Company Captable</div>
        <div class="flex gap-2 mb-2">
            <input 
                class="flex-1 p-2 border rounded bg-[color:var(--background)] text-[color:var(--foreground)]" 
                bind:value={contractInput} 
                placeholder="Contract address" 
            />
            <button 
                class="px-4 py-2 bg-[color:var(--primary)] text-[color:var(--background)] rounded hover:bg-[color:var(--accent)] border border-[color:var(--border)]"
                onclick={() => handleLoadContract(contractInput)}
            >
                Load
            </button>
        </div>
    </div>

    <!-- Contract Details Card -->
    {#if tzktStorageData.admin_address !== null}
        <div class="rounded-sm shadow p-0 overflow-hidden border border-[color:var(--border)]" style="background: linear-gradient(90deg, #232B3A 60%, #2d3650 100%);">
            <div class="bg-[color:var(--card)] px-6 py-4 flex items-center justify-between border-b border-[color:var(--border)]">
                <div class="font-bold text-xl text-[color:var(--primary)]">Share Register for Company {tzktStorageData.registry_number}</div>
            </div>
            <div class="px-6 py-4">
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="flex-1 p-2 border rounded bg-[color:var(--background)] font-mono text-sm cursor-default select-all text-[color:var(--foreground)]"
                        style="min-width:0;"
                    >
                        {$contractState.contractAddress}
                    </div>
                    <button
                        class="p-2 bg-[color:var(--muted)] rounded hover:bg-[color:var(--card)] border border-[color:var(--border)]"
                        title="Copy contract address"
                        aria-label="Copy contract address"
                        onclick={() => navigator.clipboard.writeText($contractState.contractAddress || '')}
                    >
                        <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </button>
                    <a
                        class="p-2 bg-[color:var(--muted)] rounded hover:bg-[color:var(--card)] border border-[color:var(--border)] ml-1 flex items-center"
                        href={`https://better-call.dev/mainnet/${$contractState.contractAddress}/operations`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on TzKT Explorer"
                        aria-label="View on TzKT Explorer"
                    >
                        <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 3h7m0 0v7m0-7L10 14m-4 0v7a2 2 0 002 2h7a2 2 0 002-2v-7"/></svg>
                    </a>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-xs text-[color:var(--muted-foreground)]">Contract Admin</span>
                        <div class="font-mono text-sm text-[color:var(--foreground)]">{tzktStorageData.admin_address}</div>
                    </div>
                    <div>
                        <span class="text-xs text-[color:var(--muted-foreground)]">Registry Number</span>
                        <div class="text-sm text-[color:var(--foreground)]">{tzktStorageData.registry_number || 'Not set'}</div>
                    </div>
                </div>
                <div class="flex flex-row gap-8 justify-between border-t pt-4 border-[color:var(--border)]">
                    <div class="flex-1">
                        <span class="text-xs text-[color:var(--muted-foreground)]">Max Shares</span>
                        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.max_shares || 'Not set'}</div>
                    </div>
                    <div class="flex-1">
                        <span class="text-xs text-[color:var(--muted-foreground)]">Issued Shares</span>
                        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.issued_shares}</div>
                    </div>
                    <div class="flex-1">
                        <span class="text-xs text-[color:var(--muted-foreground)]">Unclaimed Shares</span>
                        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.total_allocated_shares}</div>
                    </div>
                </div>
            </div>

            <!-- Share Ledger Card -->
            <div class="card">
                <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleLedger}>
                    <div class="section-header">Share Ledger / Cap table <span class="text-xs text-[color:var(--muted-foreground)] ml-2">Current owners</span></div>
                    <svg class="h-5 w-5 transition-transform text-[color:var(--primary)]" style="transform: rotate({showLedger ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                {#if showLedger}
                <table class="w-full border-collapse text-sm">
                    <thead>
                        <tr class="table-header">
                            <th class="text-left p-2">Address</th>
                            <th class="text-right p-2">Owned Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if tzktShareLedgerEntries.length > 0}
                            {#each tzktShareLedgerEntries as [address, claimedShares]}
                                <tr class="table-row">
                                    <td class="font-mono p-2">
                                        {#if address.startsWith("KT1")}
                                            <button 
                                                class="text-[color:var(--primary)] hover:text-[color:var(--accent)] hover:underline text-left"
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
                                    <td class="text-right p-2">{claimedShares}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr class="table-row">
                                <td class="text-center p-2 text-[color:var(--muted-foreground)]" colspan="2">No share ledger entries</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
                {/if}
            </div>


            <!-- Share Wallet Card -->
            <div class="card">
                <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleWallet}>
                    <div class="section-header">Share Wallet</div>
                    <svg class="h-5 w-5 transition-transform text-[color:var(--primary)]" style="transform: rotate({showWallet ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                {#if showWallet}
                    <div class="space-y-4">
                        {#if tzktHeldExternalSharesEntries.length > 0}
                            {#each tzktHeldExternalSharesEntries as [_, ticket]}
                                <div class="bg-[color:var(--background)] rounded-xl shadow-md p-5 flex flex-col gap-3 border border-[color:var(--border)]">
                                    <div class="grid grid-cols-2 gap-4 mt-2">
                                    <div class="flex flex-col items-stretch">
                                        <span class="text-xs text-[color:var(--muted-foreground)]">Registry number</span>
                                        <span class="text-base font-semibold text-[color:var(--foreground)]">{maxSharesCache[ticket.address]?.registry_number || 'Not set'}</span>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <span class="text-xs text-[color:var(--muted-foreground)]">Amount</span>
                                        <span class="text-lg font-bold text-[color:var(--primary)]">
                                        {ticket.amount}
                                        {#if maxSharesLoading[ticket.address]}
                                            <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ ...</span>
                                        {:else if maxSharesCache[ticket.address]}
                                            <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ {maxSharesCache[ticket.address].issued_shares || maxSharesCache[ticket.address].max_shares}</span>
                                        {:else}
                                            <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ ?</span>
                                        {/if}
                                        </span>
                                    </div>
                                    </div>
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <div class="text-xs text-[color:var(--muted-foreground)] font-semibold">Issuing contract</div>
                                            <button class="font-mono text-sm break-all text-[color:var(--primary)] hover:text-[color:var(--accent)] hover:underline" title="Load this contract" onclick={() => { $contractState.contractAddress = ticket.address; handleLoadContract(ticket.address); }}>
                                                {ticket.address}
                                            </button>
                                        </div>
                                        <button class="btn-secondary p-2 flex items-center gap-1 mt-1" title="Transfer" onclick={() => { openTransferCard = openTransferCard === ticket.address ? null : ticket.address; }}>
                                            <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                            <span class="text-xs">Transfer</span>
                                        </button>
                                    </div>
                                    {#if openTransferCard === ticket.address}
                                        {#key openTransferCard}
                                            <form class="mt-2 flex flex-col gap-2" onsubmit={(e) => handleTransfer(e, ticket)}>
                                                <input
                                                    class="input"
                                                    placeholder="Enter destination address"
                                                    value={transferForms[ticket.address]?.destination || ''}
                                                    oninput={(e) => {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        transferForms[ticket.address] = { ...(transferForms[ticket.address] || { amount: '' }), destination: val };
                                                    }}
                                                    disabled={loadingStates.transfer}
                                                />
                                                <input
                                                    class="input"
                                                    placeholder="Enter amount"
                                                    type="number"
                                                    min="1"
                                                    value={transferForms[ticket.address]?.amount || ''}
                                                    oninput={(e) => {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        transferForms[ticket.address] = { ...(transferForms[ticket.address] || { destination: '' }), amount: val };
                                                    }}
                                                    disabled={loadingStates.transfer}
                                                />
                                                {#if errorStates.transfer}
                                                    <div class="text-[color:var(--destructive)]">{errorStates.transfer}</div>
                                                {/if}
                                                <button 
                                                    type="submit" 
                                                    class="btn-primary"
                                                    disabled={loadingStates.transfer}
                                                >
                                                    {#if loadingStates.transfer}
                                                        Transferring<LoadingDots />
                                                    {:else}
                                                        Transfer
                                                    {/if}
                                                </button>
                                            </form>
                                        {/key}
                                    {/if}
                                </div>
                            {/each}
                        {:else}
                            <div class="text-center p-2 text-[color:var(--muted-foreground)]">No external shares held</div>
                        {/if}
    
                        <!-- Claim Shares Section -->
                        <div class="mt-6 border-t border-[color:var(--border)] pt-4">
                            <h3 class="section-header">Claim Shares</h3>
                            <form class="space-y-3" onsubmit={(e) => handleClaimShares(e)}>
                                <input 
                                    type="text" 
                                    class="input w-full"
                                    placeholder="Enter issuing contract address to claim shares to your wallet"
                                    value={userForms.claimShares.address}
                                    oninput={(e) => {
                                        const val = (e.target as HTMLInputElement).value;
                                        userForms.claimShares = { ...userForms.claimShares, address: val };
                                    }}
                                    disabled={loadingStates.claimShares}
                                />
                                {#if errorStates.claimShares}
                                    <div class="text-[color:var(--destructive)]">{errorStates.claimShares}</div>
                                {/if}
                                <div class="flex justify-end">
                                    <button 
                                        type="submit"
                                        class="btn-primary"
                                        disabled={loadingStates.claimShares}
                                    >
                                        {#if loadingStates.claimShares}
                                            Claiming<LoadingDots />
                                        {:else}
                                            Claim Shares
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        {/if}

    <!-- Unclaimed Share Pool Card (Less Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="card">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleUnclaimed}>
                <div class="section-header">Unclaimed Share Pool</div>
                <svg class="h-5 w-5 transition-transform text-[color:var(--primary)]" style="transform: rotate({showUnclaimed ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showUnclaimed}
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="table-header">
                        <th class="text-left p-2">Issuer</th>
                        <th class="text-right p-2">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#if tzktUnclaimedSharePoolEntries.length > 0}
                        {#each tzktUnclaimedSharePoolEntries as [_, ticket]}
                            <tr class="table-row">
                                <td class="text-left p-2">{ticket.address}</td>
                                <td class="text-right p-2">{ticket.amount}</td>
                            </tr>
                        {/each}
                    {:else}
                        <tr class="table-row">
                            <td class="text-center p-2 text-[color:var(--muted-foreground)]" colspan="2">No unclaimed shares</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
            {/if}
        </div>
    {/if}

    <!-- Eligible Claimants Card (Less Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="card">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleClaimants}>
                <div class="section-header">Eligible Claimants</div>
                <svg class="h-5 w-5 transition-transform text-[color:var(--primary)]" style="transform: rotate({showClaimants ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showClaimants}
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="table-header">
                        <th class="text-left p-2">Address</th>
                        <th class="text-right p-2">Entitled Shares</th>
                    </tr>
                </thead>
                <tbody>
                    {#if tzktEligibleClaimantsEntries.length > 0}
                        {#each tzktEligibleClaimantsEntries as [address, shares]}
                            <tr class="table-row">
                                <td class="font-mono p-2">
                                    {#if address.startsWith('KT1')}
                                        <button 
                                            class="text-[color:var(--primary)] hover:text-[color:var(--accent)] hover:underline text-left"
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
                                <td class="text-right p-2">{shares}</td>
                            </tr>
                        {/each}
                    {:else}
                        <tr class="table-row">
                            <td class="text-center p-2 text-[color:var(--muted-foreground)]" colspan="2">No eligible claimants registered</td>
                        </tr>
                    {/if}
                </tbody>
            </table>

            <!-- Direct Claim Section -->
            <div class="mt-6 border-t border-[color:var(--border)] pt-4">
                <h3 class="section-header">Direct Claim Shares</h3>
                <form class="space-y-3" onsubmit={(e) => handleClaimSharesDirect(e)}>
                    <input 
                        type="text" 
                        class="input w-full"
                        placeholder="Enter destination address"
                        value={userForms.claimSharesDirect.destination_address}
                        oninput={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            userForms.claimSharesDirect = { ...userForms.claimSharesDirect, destination_address: val };
                        }}
                        disabled={loadingStates.claimSharesDirect}
                    />
                    {#if errorStates.claimSharesDirect}
                        <div class="text-[color:var(--destructive)]">{errorStates.claimSharesDirect}</div>
                    {/if}
                    <button 
                        type="submit"
                        class="btn-primary w-full"
                        disabled={loadingStates.claimSharesDirect}
                    >
                        {#if loadingStates.claimSharesDirect}
                            Claiming<LoadingDots />
                        {:else}
                            Direct Claim Shares
                        {/if}
                    </button>
                </form>
            </div>
            {/if}
        </div>
    {/if}
 
    <!-- Contract Operations Card -->
    {#if $contractState.contractAddress !== null && $contractState.isLoaded}
        <div class="card">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleAdminOps}>
                <div class="section-header">Admin Operations</div>
                <svg class="h-5 w-5 transition-transform text-[color:var(--primary)]" style="transform: rotate({showAdminOps ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showAdminOps}
                <ContractOps />
            {/if}
        </div>
    {/if}

</div>
