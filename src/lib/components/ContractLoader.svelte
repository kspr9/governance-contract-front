<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { contractState, contractInstance } from '../stores/contractStore.svelte';
    import { tzktStorageData } from '../stores/tzktStorage.svelte';
    import ContractOpsRefactored from "./ContractOpsRefactored.svelte";
    import { loadContractTzkt } from '../utils/contractLoader';
    import CreateCompany from "../CreateCompany.svelte";
    import { transferHeldShares } from '../utils/contractActions';
    import { resetProvider } from '../config/beaconConfig';
    import { toastStore } from '../stores/toastStore.svelte';
    import Toast from './Toast.svelte';
    import LoadingDots from './LoadingDots.svelte';
    import { beaconState } from "../stores/beaconStore.svelte";
    import { estonianRegistryCache } from '../stores/estonianRegistryCache.svelte';
    import { shareLedgerStore } from '../stores/shareLedgerStore.svelte';
    import ContractSummary from './ContractSummary.svelte';
    import DashboardTabs from './DashboardTabs.svelte';
    import OwnedShareWallet from './OwnedShareWallet.svelte';
    import CapTable from './CapTable.svelte';
    
    
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
        claimShares: { address: '' }
    });

    // Add loading states
    let loadingStates = $state({
        claimShares: false
    });

    // Add error states
    let errorStates = $state({
        claimShares: null as string | null
    });

    // Add state for admin operations collapse
    let showAdminOps = $state(false);
    function toggleAdminOps() { showAdminOps = !showAdminOps; }

    // Add state for company data
    let companyData = $state<{ name: string; status: string; address?: string; registryCode?: string } | null>(null);

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
     * Fetch shareholder name from Estonian Business Registry via cache
     */
    async function fetchShareholderName(registryNumber: string) {
        if (!registryNumber || shareholderNameCache[registryNumber]) return;

        // Set loading state in local cache
        shareholderNameCache[registryNumber] = { loading: true };

        try {
            // Get data from centralized registry cache
            const companyData = await estonianRegistryCache.getCompanyData(registryNumber);
            
            if (companyData && companyData.name) {
                shareholderNameCache[registryNumber] = { name: companyData.name, loading: false };
            } else {
                // Check for error state in cache
                const cacheEntry = estonianRegistryCache.getCacheEntry(registryNumber);
                const errorMessage = cacheEntry?.error || 'Company not found';
                shareholderNameCache[registryNumber] = { error: errorMessage, loading: false };
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
     * Fetch company data from Estonian Business Registry via cache
     */
    async function fetchEstonianCompanyData(registryNumber: string) {
        companyDataLoading = true;
        companyDataError = null;
        
        try {
            console.log('Starting Estonian company data fetch for registry number:', registryNumber);
            
            // Get data from centralized registry cache
            const data = await estonianRegistryCache.getCompanyData(registryNumber);
            console.log('Received company data response from cache:', data);
            
            if (data) {
                companyData = {
                    name: data.name,
                    registryCode: data.registryCode,
                    status: data.status,
                    address: data.address
                };
                console.log('Successfully updated company data state:', companyData);
            } else {
                // Check for error state in cache
                const cacheEntry = estonianRegistryCache.getCacheEntry(registryNumber);
                const errorMessage = cacheEntry?.error || 'Company not found';
                console.log('No company data returned from cache, error:', errorMessage);
                companyDataError = errorMessage;
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
                const contract = await import('../config/beaconConfig').then(m => m.Tezos.wallet.at($contractState.contractAddress as string));
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


</script>

<div class="space-y-6">
    <Toast />
    
    {#if tzktStorageData.admin_address !== null}
        <!-- Contract Summary -->
        <ContractSummary
            {companyData}
            {companyDataLoading}
            {companyDataError}
            {handleLoadContract}
        />
        
        <!-- Dashboard Tabs -->
        <DashboardTabs>
            {#snippet children(activeTab: string)}
                {#if activeTab === 'wallet'}
                    <OwnedShareWallet
                        {maxSharesCache}
                        {maxSharesLoading}
                        {handleLoadContract}
                    />
                    
                {:else if activeTab === 'register'}
                    <CapTable
                        {maxSharesCache}
                        {maxSharesLoading}
                        {shareholderNameCache}
                        {handleLoadContract}
                    />
                    
                {:else if activeTab === 'admin'}
                    <ContractOpsRefactored {handleLoadContract} />
                {/if}
            {/snippet}
        </DashboardTabs>
    {:else}
        
    {/if}

</div>
