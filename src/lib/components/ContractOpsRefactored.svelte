<script lang="ts">
    import { contractState, contractInstance } from '../stores/contractStore.svelte';
    import { tzktStorageData } from '../stores/tzktStorage.svelte';
    import { beaconState } from '../stores/beaconStore.svelte';
    import { Tezos, wallet, resetProvider } from '../config/beaconConfig';
    import Toast from './Toast.svelte';
    import { onMount } from "svelte";
    import HelpTip from './HelpTip.svelte';
    import CollapsibleSection from './shared/CollapsibleSection.svelte';
    
    // Form components
    import AllocateSharesForm from './forms/AllocateSharesForm.svelte';
    import MintSharesForm from './forms/MintSharesForm.svelte';
    import ChangeMaxSharesForm from './forms/ChangeMaxSharesForm.svelte';
    import ChangeAdminForm from './forms/ChangeAdminForm.svelte';
    import AddCompanyDataForm from './forms/AddCompanyDataForm.svelte';
    
    let { handleLoadContract }: { handleLoadContract: (address: string) => Promise<void> } = $props();
    
    // State for collapsible sections
    let showAdminFunctions = $state(true);
    let showUserFunctions = $state(true);
    
    // State for individual admin forms
    let showAllocateForm = $state(false);
    let showMintForm = $state(false);
    let showChangeMaxForm = $state(false);
    let showChangeAdminForm = $state(false);
    let showAddCompanyForm = $state(false);
    
    // Track which user form is currently active
    let activeUserForm = $state<string | null>(null);
    
    // Admin authorization check
    const isAdmin = $derived(
        beaconState.address !== null && 
        tzktStorageData.admin_address !== null && 
        beaconState.address === tzktStorageData.admin_address
    );
    
    async function connectContract() {
        try {
            await resetProvider();
            
            console.log("Wallet ready for contract:", wallet?.getPKH());
        
            if (!$contractState.contractAddress) {
                throw new Error("Contract address not set");
            }
            if (!beaconState.isConnected) {
                throw new Error("Wallet not connected");
            }

            const contract = await Tezos.wallet.at($contractState.contractAddress);
            console.log("Contract connected successfully", contract);
            contractInstance.set(contract);
            
        } catch (error) {
            console.error("Failed to load contract:", error);
            throw error;
        }
    }

    onMount(() => {
        if (beaconState.isConnected && $contractState.contractAddress) {
            connectContract();
        }
    });
    
    function showUserForm(formType: string) {
        activeUserForm = activeUserForm === formType ? null : formType;
    }
    
    function handleFormSuccess() {
        // Close all admin forms on success
        showAllocateForm = false;
        showMintForm = false;
        showChangeMaxForm = false;
        showChangeAdminForm = false;
        showAddCompanyForm = false;
        activeUserForm = null;
    }
</script>

<div class="space-y-4 mb-8">
    <Toast />
    
    {#if !beaconState.isConnected}
        <div class="card">
            <p class="text-muted-foreground">Please connect your wallet to perform contract operations.</p>
        </div>
    {:else if !$contractState.contractAddress}
        <div class="card">
            <p class="text-muted-foreground">Please load a contract first.</p>
        </div>
    {:else}
        <!-- Admin Functions Section -->
        {#if isAdmin}
            <CollapsibleSection 
                title="Admin Functions"
                bind:open={showAdminFunctions}
            >
                <div class="admin-functions-container">
                    
                    <MintSharesForm 
                        bind:open={showMintForm}
                        onSuccess={handleFormSuccess}
                        {handleLoadContract}
                    />
                
                    <AllocateSharesForm 
                        bind:open={showAllocateForm}
                        onSuccess={handleFormSuccess}
                        {handleLoadContract}
                    />

                    <ChangeMaxSharesForm 
                        bind:open={showChangeMaxForm}
                        onSuccess={handleFormSuccess}
                        {handleLoadContract}
                    />
                    
                    <ChangeAdminForm 
                        bind:open={showChangeAdminForm}
                        onSuccess={handleFormSuccess}
                        {handleLoadContract}
                    />
                    
                    <AddCompanyDataForm 
                        bind:open={showAddCompanyForm}
                        onSuccess={handleFormSuccess}
                        {handleLoadContract}
                    />
                </div>
            </CollapsibleSection>
        {:else}
            <div class="card">
                <p class="text-muted-foreground">You are not authorized to perform admin functions. Only the contract admin can access these features.</p>
            </div>
        {/if}
        
        <!-- User Functions Section -->
        <!-- Removed: Distribute Allocated Shares section and related UI -->
    {/if}
</div>

<style>
    .contract-ops {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }
    
    .admin-functions-container {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }
    
    .function-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>