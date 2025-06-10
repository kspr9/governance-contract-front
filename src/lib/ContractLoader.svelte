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
    let showLedger = $state(true);
    let showWallet = $state(true);
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
    let showAdminOps = $state(true);
    function toggleAdminOps() { showAdminOps = !showAdminOps; }

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

    async function handleLoadContract() {
        const entries = await loadContractTzkt();
        tzktEligibleClaimantsEntries = entries.eligibleClaimantsEntries;
        tzktUnclaimedSharePoolEntries = entries.unclaimedSharePoolEntries;
        tzktHeldExternalSharesEntries = entries.heldExternalSharesEntries;
        tzktShareLedgerEntries = entries.shareLedgerEntries;
        // Connect contract for wallet operations
        await resetProvider();
        if ($contractState.contractAddress && typeof $contractState.contractAddress === 'string') {
            const contract = await import('./config/beaconConfig').then(m => m.Tezos.wallet.at($contractState.contractAddress as string));
            contractInstance.set(await contract);
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
            await handleLoadContract();
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
            await handleLoadContract();
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
            await handleLoadContract();
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
    <div class="bg-violet-200 rounded-lg shadow p-4">
        <div class="font-semibold text-lg mb-2">Load your Wallet Contract</div>
        <div class="flex gap-2 mb-2">
            <input 
                class="flex-1 p-2 border rounded" 
                bind:value={$contractState.contractAddress} 
                placeholder="Contract address" 
            />
            <button 
                class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onclick={handleLoadContract}
            >
                Load
            </button>
        </div>
    </div>

    <!-- Contract Details Card -->
    {#if tzktStorageData.admin_address !== null}
        <div class="rounded-lg shadow p-0 overflow-hidden" style="background: linear-gradient(90deg, #e0e7ff 60%, #f5f3ff 100%);">
            <div class="bg-violet-200 px-6 py-4 flex items-center justify-between">
                <div class="font-bold text-xl">Wallet Contract</div>
                <!-- Optionally, add an icon or avatar here -->
            </div>
            <div class="px-6 py-4">
                <div class="flex items-center gap-2 mb-4">
                    <input
                        class="flex-1 p-2 border rounded bg-white font-mono text-sm cursor-default select-all"
                        value={$contractState.contractAddress}
                        readonly
                        style="min-width:0;"
                    />
                    <button
                        class="p-2 bg-violet-100 rounded hover:bg-violet-200"
                        title="Copy contract address"
                        aria-label="Copy contract address"
                        onclick={() => navigator.clipboard.writeText($contractState.contractAddress || '')}
                    >
                        <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-xs text-gray-500">Contract Admin</span>
                        <div class="font-mono text-sm">{tzktStorageData.admin_address}</div>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500">Registry Number</span>
                        <div class="text-sm">{tzktStorageData.registry_number || 'Not set'}</div>
                    </div>
                </div>
                <div class="flex flex-row gap-8 justify-between border-t pt-4">
                    <div class="flex-1">
                        <span class="text-xs text-gray-500">Max Shares</span>
                        <div class="text-2xl font-bold">{tzktStorageData.max_shares || 'Not set'}</div>
                    </div>
                    <div class="flex-1">
                        <span class="text-xs text-gray-500">Issued Shares</span>
                        <div class="text-2xl font-bold">{tzktStorageData.issued_shares}</div>
                    </div>
                    <div class="flex-1">
                        <span class="text-xs text-gray-500">Unclaimed Shares</span>
                        <div class="text-2xl font-bold">{tzktStorageData.total_allocated_shares}</div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Share Ledger Card (Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="bg-indigo-50 rounded-lg shadow p-4">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleLedger}>
                <div class="font-semibold text-lg">Share Ledger <span class="text-xs text-indigo-600 ml-2">Current owners</span></div>
                <svg class="h-5 w-5 transition-transform" style="transform: rotate({showLedger ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showLedger}
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th class="text-left p-2 bg-gray-100">Address</th>
                        <th class="text-right p-2 bg-gray-100">Owned Shares</th>
                    </tr>
                </thead>
                <tbody>
                    {#if tzktShareLedgerEntries.length > 0}
                        {#each tzktShareLedgerEntries as [address, claimedShares]}
                            <tr class="border-t">
                                <td class="font-mono p-2">
                                    {#if address.startsWith("KT1")}
                                        <button 
                                            class="text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                                            onclick={() => {
                                                $contractState.contractAddress = address;
                                                handleLoadContract();
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
                        <tr class="border-t">
                            <td class="text-center p-2 text-gray-500" colspan="2">No share ledger entries</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
            {/if}
        </div>
    {/if}

    <!-- Share Wallet Card (Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="bg-indigo-50 rounded-lg shadow p-4">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleWallet}>
                <div class="font-semibold text-lg">Share Wallet</div>
                <svg class="h-5 w-5 transition-transform" style="transform: rotate({showWallet ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showWallet}
                <div class="space-y-4">
                    {#if tzktHeldExternalSharesEntries.length > 0}
                        {#each tzktHeldExternalSharesEntries as [_, ticket]}
                            <div class="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 border border-violet-100">
                                <div class="grid grid-cols-2 gap-4 mt-2">
                                <div class="flex flex-col items-stretch">
                                    <span class="text-xs text-gray-500">Registry number</span>
                                    <span class="text-base font-semibold">{maxSharesCache[ticket.address]?.registry_number || 'Not set'}</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <span class="text-xs text-gray-500">Amount</span>
                                    <span class="text-lg font-bold">
                                    {ticket.amount}
                                    {#if maxSharesLoading[ticket.address]}
                                        <span class="text-xs text-gray-400 ml-2">/ ...</span>
                                    {:else if maxSharesCache[ticket.address]}
                                        <span class="text-xs text-gray-500 ml-2">/ {maxSharesCache[ticket.address].issued_shares || maxSharesCache[ticket.address].max_shares}</span>
                                    {:else}
                                        <span class="text-xs text-gray-400 ml-2">/ ?</span>
                                    {/if}
                                    </span>
                                </div>
                                </div>
                                <div class="flex items-start justify-between">
                                    <div>
                                        <div class="text-xs text-gray-500 font-semibold">Issuing contract</div>
                                        <button class="font-mono text-sm break-all text-indigo-600 hover:underline" title="Load this contract" onclick={() => { $contractState.contractAddress = ticket.address; handleLoadContract(); }}>
                                            {ticket.address}
                                        </button>
                                    </div>
                                    <button class="p-2 flex items-center gap-1 bg-violet-100 rounded hover:bg-violet-200 font-semibold text-violet-700 mt-1" title="Transfer" onclick={() => { openTransferCard = openTransferCard === ticket.address ? null : ticket.address; }}>
                                        <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                        <span class="text-xs">Transfer</span>
                                    </button>
                                </div>
                                {#if openTransferCard === ticket.address}
                                    {#key openTransferCard}
                                        <form class="mt-2 flex flex-col gap-2" onsubmit={(e) => handleTransfer(e, ticket)}>
                                            <input
                                                class="p-2 border rounded"
                                                placeholder="Enter destination address"
                                                value={transferForms[ticket.address]?.destination || ''}
                                                oninput={(e) => {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    transferForms[ticket.address] = { ...(transferForms[ticket.address] || { amount: '' }), destination: val };
                                                }}
                                                disabled={loadingStates.transfer}
                                            />
                                            <input
                                                class="p-2 border rounded"
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
                                                <div class="text-red-500 text-sm">{errorStates.transfer}</div>
                                            {/if}
                                            <button 
                                                type="submit" 
                                                class="px-4 py-2 bg-violet-400 text-white rounded hover:bg-violet-500 disabled:bg-violet-300"
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
                        <div class="text-center p-2 text-gray-500">No external shares held</div>
                    {/if}

                    <!-- Claim Shares Section -->
                    <div class="mt-6 border-t pt-4">
                        <h3 class="text-lg font-semibold mb-3">Claim Shares</h3>
                        <form class="space-y-3" onsubmit={(e) => handleClaimShares(e)}>
                            <input 
                                type="text" 
                                class="w-full p-2 border rounded"
                                placeholder="Enter issuing contract address to claim shares to your wallet"
                                value={userForms.claimShares.address}
                                oninput={(e) => {
                                    const val = (e.target as HTMLInputElement).value;
                                    userForms.claimShares = { ...userForms.claimShares, address: val };
                                }}
                                disabled={loadingStates.claimShares}
                            />
                            {#if errorStates.claimShares}
                                <div class="text-red-500 text-sm">{errorStates.claimShares}</div>
                            {/if}
                            <button 
                                type="submit"
                                class="w-full px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 disabled:bg-violet-300"
                                disabled={loadingStates.claimShares}
                            >
                                {#if loadingStates.claimShares}
                                    Claiming<LoadingDots />
                                {:else}
                                    Claim Shares
                                {/if}
                            </button>
                        </form>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Unclaimed Share Pool Card (Less Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="bg-white rounded-lg shadow p-4">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleUnclaimed}>
                <div class="font-medium text-base">Unclaimed Share Pool</div>
                <svg class="h-5 w-5 transition-transform" style="transform: rotate({showUnclaimed ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showUnclaimed}
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th class="text-left p-2 bg-gray-100">Issuer</th>
                        <th class="text-right p-2 bg-gray-100">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#if tzktUnclaimedSharePoolEntries.length > 0}
                        {#each tzktUnclaimedSharePoolEntries as [_, ticket]}
                            <tr class="border-t">
                                <td class="text-left p-2">{ticket.address}</td>
                                <td class="text-right p-2">{ticket.amount}</td>
                            </tr>
                        {/each}
                    {:else}
                        <tr class="border-t">
                            <td class="text-center p-2 text-gray-500" colspan="2">No unclaimed shares</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
            {/if}
        </div>
    {/if}

    <!-- Eligible Claimants Card (Less Prominent) -->
    {#if tzktStorageData.admin_address !== null}
        <div class="bg-white rounded-lg shadow p-4">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleClaimants}>
                <div class="font-medium text-base">Eligible Claimants</div>
                <svg class="h-5 w-5 transition-transform" style="transform: rotate({showClaimants ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showClaimants}
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th class="text-left p-2 bg-gray-100">Address</th>
                        <th class="text-right p-2 bg-gray-100">Entitled Shares</th>
                    </tr>
                </thead>
                <tbody>
                    {#if tzktEligibleClaimantsEntries.length > 0}
                        {#each tzktEligibleClaimantsEntries as [address, shares]}
                            <tr class="border-t">
                                <td class="font-mono p-2">
                                    {#if address.startsWith('KT1')}
                                        <button 
                                            class="text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                                            onclick={() => {
                                                $contractState.contractAddress = address;
                                                handleLoadContract();
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
                        <tr class="border-t">
                            <td class="text-center p-2 text-gray-500" colspan="2">No eligible claimants registered</td>
                        </tr>
                    {/if}
                </tbody>
            </table>

            <!-- Direct Claim Section -->
            <div class="mt-6 border-t pt-4">
                <h3 class="text-lg font-semibold mb-3">Direct Claim Shares</h3>
                <form class="space-y-3" onsubmit={(e) => handleClaimSharesDirect(e)}>
                    <input 
                        type="text" 
                        class="w-full p-2 border rounded"
                        placeholder="Enter destination address"
                        value={userForms.claimSharesDirect.destination_address}
                        oninput={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            userForms.claimSharesDirect = { ...userForms.claimSharesDirect, destination_address: val };
                        }}
                        disabled={loadingStates.claimSharesDirect}
                    />
                    {#if errorStates.claimSharesDirect}
                        <div class="text-red-500 text-sm">{errorStates.claimSharesDirect}</div>
                    {/if}
                    <button 
                        type="submit"
                        class="w-full px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 disabled:bg-violet-300"
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
    {#if $contractState.contractAddress !== null}
        <div class="bg-orange-50 rounded-lg shadow p-4">
            <button type="button" class="flex items-center justify-between w-full mb-2 cursor-pointer" onclick={toggleAdminOps}>
                <div class="font-semibold text-lg">Admin Operations</div>
                <svg class="h-5 w-5 transition-transform" style="transform: rotate({showAdminOps ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            {#if showAdminOps}
                <ContractOps />
            {/if}
        </div>
    {/if}

</div>
