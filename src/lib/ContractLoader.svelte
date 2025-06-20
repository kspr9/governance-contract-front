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
    import OwnedShareCard from './components/OwnedShareCard.svelte';
    import { fetchCompanyData } from './utils/estonianRegistry';
    import { shareLedgerStore } from './stores/shareLedgerStore.svelte';
    
    
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

    let { state: shareLedgerState } = shareLedgerStore;

    let sortedShareLedgerEntries = $derived([...shareLedgerState.shareLedger].sort((a, b) => Number(b[1]) - Number(a[1])));

    // Collapsible state
    let showLedger = $state(true);
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
        claimShares: false,
        claimSharesDirect: false
    });

    // Add error states
    let errorStates = $state({
        claimShares: null as string | null,
        claimSharesDirect: null as string | null
    });

    // Add state for admin operations collapse
    let showAdminOps = $state(false);
    function toggleAdminOps() { showAdminOps = !showAdminOps; }

    let contractInput = $state('');

    // Add state for company data
    let companyData = $state<{ name: string; status: string; address?: string } | null>(null);

    // Add loading state for company data
    let companyDataLoading = $state(false);

    // Add error state for company data
    let companyDataError = $state<string | null>(null);

    // Add cache for shareholder names
    let shareholderNameCache = $state<Record<string, { name?: string; loading: boolean; error?: string }>>({});

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

    /**
     * Fetch shareholder name from Estonian Business Registry
     */
    async function fetchShareholderName(registryNumber: string) {
        if (!registryNumber || shareholderNameCache[registryNumber]) return;

        shareholderNameCache[registryNumber] = { loading: true };

        try {
            // Get credentials from environment variables
            const username = import.meta.env.VITE_ESTONIAN_REGISTRY_USERNAME;
            const password = import.meta.env.VITE_ESTONIAN_REGISTRY_PASSWORD;
            
            if (!username || !password) {
                throw new Error('Estonian Business Registry credentials not configured');
            }

            const data = await fetchCompanyData(registryNumber, username, password);
            if (data && data.name) {
                shareholderNameCache[registryNumber] = { name: data.name, loading: false };
            } else {
                throw new Error('Company not found');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch name';
            shareholderNameCache[registryNumber] = { error: message, loading: false };
            console.error(`Failed to fetch shareholder name for ${registryNumber}:`, error);
        }
    }

    // On contract load, fetch max_shares for all unique issuing contracts in held_external_shares
    $effect(() => {
        const uniqueIssuers = new Set<string>();
        for (const [_, ticket] of shareLedgerState.heldExternalShares) {
            if (ticket && ticket.address) {
                uniqueIssuers.add(ticket.address);
            }
        }
        for (const [address, _] of shareLedgerState.shareLedger) {
            if (address.startsWith('KT1')) {
                uniqueIssuers.add(address);
            }
        }
        uniqueIssuers.forEach(addr => fetchMaxShares(addr));
    });

    // Fetch shareholder names when share ledger is updated
    $effect(() => {
        for (const [address, _] of shareLedgerState.shareLedger) {
            if (address.startsWith('KT1') && maxSharesCache[address]?.registry_number) {
                const registryNumber = maxSharesCache[address].registry_number;
                if (registryNumber && registryNumber.length === 8) {
                    fetchShareholderName(registryNumber);
                }
            }
        }
    });

    /**
     * Fetch company data from Estonian Business Registry
     */
    async function fetchEstonianCompanyData(registryNumber: string) {
        companyDataLoading = true;
        companyDataError = null;
        
        try {
            console.log('Starting Estonian company data fetch for registry number:', registryNumber);
            
            // Get credentials from environment variables
            const username = import.meta.env.VITE_ESTONIAN_REGISTRY_USERNAME;
            const password = import.meta.env.VITE_ESTONIAN_REGISTRY_PASSWORD;
            
            // Log credential presence (not the actual values)
            console.log('Credentials check:', {
                hasUsername: !!username,
                hasPassword: !!password
            });
            
            if (!username || !password) {
                throw new Error('Estonian Business Registry credentials not configured');
            }
            
            console.log('Calling fetchCompanyData...');
            const data = await fetchCompanyData(registryNumber, username, password);
            console.log('Received company data response:', data);
            
            if (data) {
                companyData = data;
                console.log('Successfully updated company data state:', companyData);
            } else {
                console.log('No company data returned from API');
                companyDataError = 'Company not found';
            }
        } catch (error) {
            console.error('Failed to fetch company data:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            companyDataError = error instanceof Error ? error.message : 'Failed to fetch company data';
            toastStore.add('error', 'Failed to fetch company data from Estonian Business Registry');
        } finally {
            companyDataLoading = false;
            console.log('Company data fetch completed. Final states:', {
                companyData,
                companyDataError,
                companyDataLoading
            });
        }
    }

    /**
     * Test contracts
     * KT1SP3hazeQKE1Sk8MKaCED86GPGhyX2Jyu3
     * KT1SJjCTroZ3NgZJSqZp48EXWknGntFWVSKC
    */

    onMount(async () => {
        // If a contract address is already in the state on load, fetch its data
        if ($contractState.contractAddress) {
            handleLoadContract($contractState.contractAddress);
        }
    });

    export async function handleLoadContract(address: string) {
        if (!address) return;
        $contractState.contractAddress = address;
        
        shareLedgerStore.setLoading(true);
        try {
            const entries = await loadContractTzkt();
            shareLedgerStore.set({
                eligibleClaimants: entries.eligibleClaimantsEntries,
                unclaimedSharePool: entries.unclaimedSharePoolEntries,
                heldExternalShares: entries.heldExternalSharesEntries,
                shareLedger: entries.shareLedgerEntries
            });
            contractState.update(state => ({ ...state, isLoaded: true }));
            
            // Connect contract for wallet operations
            await resetProvider();
            if ($contractState.contractAddress && typeof $contractState.contractAddress === 'string') {
                const contract = await import('./config/beaconConfig').then(m => m.Tezos.wallet.at($contractState.contractAddress as string));
                contractInstance.set(contract);
            }

            // Reset company data
            companyData = null;
            companyDataError = null;

            // Fetch company data if we have a registry number
            if (tzktStorageData.registry_number) {
                await fetchEstonianCompanyData(tzktStorageData.registry_number);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load contract data';
            shareLedgerStore.setError(message);
            toastStore.add('error', message);
        } finally {
            shareLedgerStore.setLoading(false);
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
        <div class="font-semibold text-lg mb-2 text-[color:var(--primary)]">Load Company Share Register</div>
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
                <div>
                    <div class="font-bold text-xl text-[color:var(--primary)]">
                        {#if companyDataLoading}
                            Loading company data<LoadingDots />
                        {:else if companyData}
                            {companyData.name}
                        {:else}
                            Share Register for Company {tzktStorageData.registry_number}
                        {/if}
                    </div>
                    {#if companyData}
                        <div class="text-sm text-[color:var(--muted-foreground)]">
                            Registry number: {tzktStorageData.registry_number}
                            {#if companyData.status}
                                Status: {companyData.status}
                            {/if}
                        </div>
                        {#if companyData.address}
                            <div class="text-sm text-[color:var(--muted-foreground)]">
                                {companyData.address}
                            </div>
                        {/if}
                    {/if}
                    {#if companyDataError}
                        <div class="text-sm text-[color:var(--destructive)]">
                            {companyDataError}
                        </div>
                    {/if}
                </div>
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
                        title="Reload contract data"
                        aria-label="Reload contract data"
                        onclick={() => handleLoadContract($contractState.contractAddress || '')}
                    >
                        <svg class="w-5 h-5 text-[color:var(--primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1, 1) translate(-24 0)"/>
                        </svg>
                    </button>
                    <a
                        class="p-2 bg-[color:var(--muted)] rounded hover:bg-[color:var(--card)] border border-[color:var(--border)] ml-1 flex items-center"
                        href={`https://better-call.dev/mainnet/${$contractState.contractAddress}/operations`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on TzKT Explorer"
                        aria-label="View on TzKT Explorer"
                    >
                        <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
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
                <table class="w-full border-collapse text-sm table-fixed">
                    <colgroup>
                        <col style="width: 25%;" />
                        <col style="width: 15%;" />
                        <col style="width: 35%;" />
                        <col style="width: 25%;" />
                    </colgroup>
                    <thead>
                        <tr class="table-header">
                            <th class="text-left p-2">Name</th>
                            <th class="text-left p-2">Registry Number</th>
                            <th class="text-left p-2">Address</th>
                            <th class="text-right p-2">Owned Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if shareLedgerState.loading}
                            <tr class="table-row">
                                <td class="text-center p-4" colspan="4">
                                    <LoadingDots />
                                </td>
                            </tr>
                        {:else if sortedShareLedgerEntries.length > 0}
                            {#each sortedShareLedgerEntries as [address, claimedShares], i}
                                {@const registryNumber = maxSharesCache[address]?.registry_number}
                                {@const nameInfo = registryNumber ? shareholderNameCache[registryNumber] : undefined}
                                <tr class="table-row" class:zebra-stripe={i % 2 !== 0}>
                                    <td class="text-left p-2 truncate">
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
                                    <td class="text-left p-2">
                                        {#if maxSharesLoading[address]}
                                            <LoadingDots />
                                        {:else if registryNumber}
                                            {registryNumber}
                                        {:else}
                                            -
                                        {/if}
                                    </td>
                                    <td class="font-mono p-2">
                                        <div class="flex items-center gap-2">
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
                                                <span class="truncate">{address}</span>
                                            {/if}
                                        </div>
                                    </td>
                                    <td class="text-right p-2">
                                        <span>{claimedShares}</span>
                                        {#if tzktStorageData.max_shares && Number(tzktStorageData.max_shares) > 0}
                                            <span class="text-[color:var(--muted-foreground)] ml-2">
                                                ({( (Number(claimedShares) / Number(tzktStorageData.max_shares)) * 100 ).toFixed(2)}%)
                                            </span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <tr class="table-row">
                                <td class="text-center p-2 text-[color:var(--muted-foreground)]" colspan="4">No share ledger entries</td>
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
                        {#if shareLedgerState.heldExternalShares.length > 0}
                            {#each shareLedgerState.heldExternalShares as [_, ticket]}
                                <OwnedShareCard
                                    {ticket}
                                    {maxSharesCache}
                                    {maxSharesLoading}
                                    {handleLoadContract}
                                />
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
                <div class="section-header">Treasury Shares</div>
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
                    {#if shareLedgerState.unclaimedSharePool.length > 0}
                        {#each shareLedgerState.unclaimedSharePool as [_, ticket]}
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
                    {#if shareLedgerState.eligibleClaimants.length > 0}
                        {#each shareLedgerState.eligibleClaimants as [address, shares]}
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

<style>
    .zebra-stripe {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>
