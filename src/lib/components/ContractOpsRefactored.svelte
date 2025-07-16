<script lang="ts">
    import { contractState, contractInstance } from '../stores/contractStore.svelte';
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

<div class="contract-ops">
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
        {#if beaconState.isConnected}
            <CollapsibleSection 
                title="Admin Functions"
                bind:open={showAdminFunctions}
            >
                <div class="admin-functions-container">
                    <CollapsibleSection 
                        title="Allocate Shares" 
                        tooltip="Allocate shares from treasury to specific addresses"
                        bind:open={showAllocateForm}
                    >
                        <AllocateSharesForm 
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleSection>
                    
                    <CollapsibleSection 
                        title="Mint Shares" 
                        tooltip="Create new shares and add them to the treasury pool"
                        bind:open={showMintForm}
                    >
                        <MintSharesForm 
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleSection>
                    
                    <CollapsibleSection 
                        title="Change Max Shares" 
                        tooltip="Update the maximum number of shares allowed"
                        bind:open={showChangeMaxForm}
                    >
                        <ChangeMaxSharesForm 
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleSection>
                    
                    <CollapsibleSection 
                        title="Change Admin" 
                        tooltip="Transfer admin rights to another address"
                        bind:open={showChangeAdminForm}
                    >
                        <ChangeAdminForm 
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleSection>
                    
                    <CollapsibleSection 
                        title="Add Company Data" 
                        tooltip="Add company registry information to the contract"
                        bind:open={showAddCompanyForm}
                    >
                        <AddCompanyDataForm 
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleSection>
                </div>
            </CollapsibleSection>
        {/if}
        
        <!-- User Functions Section -->
        <CollapsibleSection 
            title="User Functions"
            bind:open={showUserFunctions}
        >
            <div class="functions-grid">
                <div class="function-actions">
                    <button 
                        class="btn-secondary"
                        onclick={() => showUserForm('transfer')}
                    >
                        Transfer Shares
                    </button>
                    <HelpTip text="Transfer your owned shares to another address" />
                </div>
                
                <div class="function-actions">
                    <button 
                        class="btn-secondary"
                        onclick={() => showUserForm('claim')}
                    >
                        Claim Shares
                    </button>
                    <HelpTip text="Claim shares that have been allocated to you" />
                </div>
            </div>
            
            <!-- Active User Form -->
            {#if activeUserForm === 'transfer'}
                <p class="text-muted-foreground">Transfer form component coming soon...</p>
            {:else if activeUserForm === 'claim'}
                <p class="text-muted-foreground">Claim form component coming soon...</p>
            {/if}
        </CollapsibleSection>
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
        gap: 1rem;
    }
    
    .function-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>