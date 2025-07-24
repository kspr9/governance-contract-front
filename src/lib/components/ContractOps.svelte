<script lang="ts">
    import { contractState, contractInstance } from '../stores/contractStore.svelte';
    import { tzktStorageData } from '../stores/tzktStorage.svelte';
    import { beaconState, walletStore } from '../stores/beaconStore.svelte';
    import { get } from "svelte/store";
    import { Tezos, wallet, resetProvider } from '../config/beaconConfig';
    import { loadContractTzkt } from '../utils/contractLoader';
    import { toastStore } from '../stores/toastStore.svelte';
    import Toast from './Toast.svelte';
    import { onMount, onDestroy } from "svelte";
    import LoadingDots from './LoadingDots.svelte';
    import HelpTip from './HelpTip.svelte';

    // TODO: add a loading visual to appear each time when an entrypoint is called but result is not yet received
    // clearly indicate that process is ongoing.
    // notify the user with the result - e.g. "Shares allocated successfully" or "Shares minted successfully"
    

 

    // Form states
    let adminForms = $state({
        allocateShares: { 
            amount: '' as string | number,
            ownerAddress: '' 
        },
        changeMaxShares: { newMax: null as number | null },
        mintShares: { amount: null as number | null },
        addCompanyData: {
            maxShares: null as number | null,
            registryNumber: null as number | null
        },
        changeAdmin: { newAdminAddress: '' },
        deallocateShares: { ownerAddress: '' }
    });
    
    let userForms = $state({
        transferHeldShares: { amount: null as number | null, destination: '', share: '' },
        claimShares: { address: '' },
        claimSharesDirect: { destination_address: '' }
    });

    // Add loading states
    let loadingStates = $state({
        allocateShares: false,
        changeMaxShares: false,
        mintShares: false,
        addCompanyData: false,
        changeAdmin: false,
        deallocateShares: false,
        transferHeldShares: false,
        claimShares: false,
        claimSharesDirect: false
    });

    // Add error states
    let errorStates = $state({
        allocateShares: null as string | null,
        changeMaxShares: null as string | null,
        mintShares: null as string | null,
        addCompanyData: null as string | null,
        changeAdmin: null as string | null,
        deallocateShares: null as string | null,
        transferHeldShares: null as string | null,
        claimShares: null as string | null,
        claimSharesDirect: null as string | null
    });

    // Add state for admin functions collapse
    let showAdminFunctions = $state(true);
    function toggleAdminFunctions() { showAdminFunctions = !showAdminFunctions; }

    async function connectContract() {
        try {
            // First ensure provider is properly configured
            await resetProvider();
            
            console.log("Wallet ready for contract:", wallet?.getPKH());
        
            if (!$contractState.contractAddress) {
                throw new Error("Contract address not set");
            }
            if (!beaconState.isConnected) {
                throw new Error("Wallet not connected");
            }

            // Get the contract instance
            const contract = await Tezos.wallet.at($contractState.contractAddress);
            console.log("Contract connected successfully", contract);
            contractInstance.set(contract);

            
        } catch (error) {
            console.error("Failed to load contract:", error);
            throw error;
        }
    }



    // Admin Functions
    async function handleAllocateShares(event: Event) {
        event.preventDefault();
        loadingStates.allocateShares = true;
        errorStates.allocateShares = null;
        
        try {
            // Validate amount is a number
            const amount = Number(adminForms.allocateShares.amount);
            if (isNaN(amount)) {
                throw new Error("Amount must be a valid number");
            }

            await resetProvider();
  
            const operation = await $contractInstance.methodsObject.allocate_shares_to_claimants({
                amount: amount,
                owner_address: adminForms.allocateShares.ownerAddress
            }).send();

            await operation.confirmation(2);
            console.log("Shares allocated successfully");
            // Reset form
            adminForms.allocateShares = { amount: '', ownerAddress: '' };
            await loadContractTzkt();
            toastStore.add('success', 'Shares allocated successfully');
        } catch (error) {
            console.error("Failed to allocate shares:", error);
            errorStates.allocateShares = error instanceof Error ? error.message : "Failed to allocate shares";
        } finally {
            loadingStates.allocateShares = false;
        }
    }

    async function handleChangeMaxShares(event: Event) {
        event.preventDefault();
        loadingStates.changeMaxShares = true;
        errorStates.changeMaxShares = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.change_max_shares(
                adminForms.changeMaxShares.newMax
            ).send();

            const result = await operation.confirmation(2);
            console.log("Max shares updated successfully", result);
            adminForms.changeMaxShares.newMax = null;
            await loadContractTzkt();
            toastStore.add('success', 'Maximum shares updated successfully', result.hash);
        } catch (error) {
            console.error("Failed to change max shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to change max shares";
            errorStates.changeMaxShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.changeMaxShares = false;
        }
    }

    async function handleMintShares(event: Event) {
        event.preventDefault();
        loadingStates.mintShares = true;
        errorStates.mintShares = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.mint_shares_to_pool(
                adminForms.mintShares.amount
            ).send();

            const result = await operation.confirmation(2);
            console.log("Shares minted successfully", result);
            adminForms.mintShares.amount = null;
            await loadContractTzkt();
            toastStore.add('success', 'Shares minted successfully', result.hash);
        } catch (error) {
            console.error("Failed to mint shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to mint shares";
            errorStates.mintShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.mintShares = false;
        }
    }

    // User Functions
    async function handleTransferHeldShares(event: Event) {
        event.preventDefault();
        loadingStates.transferHeldShares = true;
        errorStates.transferHeldShares = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methodsObject.transfer_held_shares({
                amount: userForms.transferHeldShares.amount,
                destination: userForms.transferHeldShares.destination,
                share: userForms.transferHeldShares.share
            }).send();

            const result = await operation.confirmation(2);
            console.log("Held shares transferred successfully", result);
            userForms.transferHeldShares = { amount: null, destination: '', share: '' };
            await loadContractTzkt();
            toastStore.add('success', 'Held shares transferred successfully', result.hash);
        } catch (error) {
            console.error("Failed to transfer held shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to transfer held shares";
            errorStates.transferHeldShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.transferHeldShares = false;
        }
    }

    async function handleClaimShares(event: Event) {
        event.preventDefault();
        loadingStates.claimShares = true;
        errorStates.claimShares = null;
        
        try {
            await resetProvider();            

            const operation = await $contractInstance.methods.claim_shares(
                userForms.claimShares.address
            ).send();

            const result = await operation.confirmation(2);
            console.log("Shares claimed successfully", result);
            userForms.claimShares.address = '';
            await loadContractTzkt();
            toastStore.add('success', 'Shares claimed successfully', result.hash);
        } catch (error) {
            console.error("Failed to claim shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to claim shares";
            errorStates.claimShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.claimShares = false;
        }
    }

    // New User Function: Direct Claim Shares
    async function handleClaimSharesDirect(event: Event) {
        event.preventDefault();
        loadingStates.claimSharesDirect = true;
        errorStates.claimSharesDirect = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.claim_shares_direct({
                destination_address: userForms.claimSharesDirect.destination_address
            }).send();

            const result = await operation.confirmation(2);
            console.log("Direct claim of shares successful", result);
            userForms.claimSharesDirect.destination_address = '';
            await loadContractTzkt();
            toastStore.add('success', 'Direct claim of shares successful', result.hash);
        } catch (error) {
            console.error("Failed to claim shares directly:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to claim shares directly";
            errorStates.claimSharesDirect = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.claimSharesDirect = false;
        }
    }

    // New admin functions
    async function handleAddCompanyData(event: Event) {
        event.preventDefault();
        loadingStates.addCompanyData = true;
        errorStates.addCompanyData = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methodsObject.add_company_data({
                max_shares: adminForms.addCompanyData.maxShares,
                registry_number: adminForms.addCompanyData.registryNumber
            }).send();

            const result = await operation.confirmation(2);
            console.log("Company data added successfully", result);
            adminForms.addCompanyData = {
                maxShares: null,
                registryNumber: null
            };
            await loadContractTzkt();
            toastStore.add('success', 'Company data added successfully', result.hash);
        } catch (error) {
            console.error("Failed to add company data:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to add company data";
            errorStates.addCompanyData = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.addCompanyData = false;
        }
    }

    async function handleChangeAdmin(event: Event) {
        event.preventDefault();
        loadingStates.changeAdmin = true;
        errorStates.changeAdmin = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.change_admin(
                adminForms.changeAdmin.newAdminAddress
            ).send();

            const result = await operation.confirmation(2);
            console.log("Admin changed successfully", result);
            adminForms.changeAdmin.newAdminAddress = '';
            await loadContractTzkt();
            toastStore.add('success', 'Admin changed successfully', result.hash);
        } catch (error) {
            console.error("Failed to change admin:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to change admin";
            errorStates.changeAdmin = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.changeAdmin = false;
        }
    }

    async function handleDeallocateShares(event: Event) {
        event.preventDefault();
        loadingStates.deallocateShares = true;
        errorStates.deallocateShares = null;
        
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.deallocate_shares_from_claimants(
                adminForms.deallocateShares.ownerAddress
            ).send();

            const result = await operation.confirmation(2);
            console.log("Shares deallocated successfully", result);
            adminForms.deallocateShares.ownerAddress = '';
            await loadContractTzkt();
            toastStore.add('success', 'Shares deallocated successfully', result.hash);
        } catch (error) {
            console.error("Failed to deallocate shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to deallocate shares";
            errorStates.deallocateShares = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loadingStates.deallocateShares = false;
        }
    }

    const isAdmin = $derived(
        beaconState.address !== null && 
        tzktStorageData.admin_address !== null && 
        beaconState.address === tzktStorageData.admin_address
    );
    
    // Debug effect to help track state changes
    $effect(() => {
        console.log('State Debug:', {
            beaconAddress: beaconState.address,
            adminAddress: tzktStorageData.admin_address,
            isAdmin
        });
    });
</script>

<div>
    <Toast />
    <!-- Always visible Connect to Contract section -->
    <div class="p-4">
        {#if !isAdmin}
        <div class="p-4 text-(--muted-foreground)">
            You are not authorized admin. Only connected admin wallet can access this section.
        </div>
        {:else}
            <button 
                onclick={connectContract}
                class="btn-primary"
            >
                { $contractInstance ? "Reconnect to Contract" : "Connect to Contract" }
            </button>
            {#if $contractState.contractAddress}
                <div class="mt-2 text-sm text-(--foreground)">
                    Contract Address: {$contractState.contractAddress}
                </div>
            {/if}
        {/if}
        
    </div>

    <!-- Provide user feedback if wallet is not connected -->
    {#if !beaconState.isConnected}
        <div class="p-4 text-(--muted-foreground)">
            Please connect your wallet first to interact with the contract.
        </div>
    {/if}

    <!-- Display operations forms if a contract is connected and wallet is connected -->
    {#if $contractInstance && beaconState.isConnected}
        <div class="p-4 space-y-6">
            {#if isAdmin}
                <button type="button" class="flex items-center justify-between w-full mb-4 cursor-pointer" onclick={toggleAdminFunctions}>
                    <div class="section-header">Admin Functions</div>
                    <svg class="h-5 w-5 transition-transform text-(--primary)" style="transform: rotate({showAdminFunctions ? 90 : 0}deg)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                {#if showAdminFunctions}
                    <div class="bg-(--background) p-4 rounded-lg space-y-6 border border-(--border)">
                        <!-- Mint Shares Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleMintShares}>
                                <h3 class="section-header">Issue new shares</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="flex flex-col gap-3">
                                    <input 
                                        type="number" 
                                        bind:value={adminForms.mintShares.amount}
                                        placeholder="Amount to Issue"
                                        class="input w-full"
                                        disabled={loadingStates.mintShares}
                                    />
                                    {#if errorStates.mintShares}
                                        <div class="text-(--destructive)">{errorStates.mintShares}</div>
                                    {/if}
                                    <div class="flex justify-end">
                                        <button 
                                            type="submit"
                                            class="btn-primary min-w-[140px]"
                                            disabled={loadingStates.mintShares}
                                        >
                                            {#if loadingStates.mintShares}
                                                Issuing<LoadingDots />
                                            {:else}
                                                Issue Shares
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Allocate Shares Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleAllocateShares}>
                                <h3 class="section-header">Allocate Shares to Claimant</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="number" 
                                        bind:value={adminForms.allocateShares.amount}
                                        placeholder="Amount"
                                        class="input w-full"
                                        disabled={loadingStates.allocateShares}
                                    />
                                    <input 
                                        type="text" 
                                        bind:value={adminForms.allocateShares.ownerAddress}
                                        placeholder="Owner Address"
                                        class="input w-full"
                                        disabled={loadingStates.allocateShares}
                                    />
                                </div>
                                {#if errorStates.allocateShares}
                                    <div class="text-(--destructive)">{errorStates.allocateShares}</div>
                                {/if}
                                <div class="flex justify-end">
                                    <button 
                                        type="submit"
                                        class="btn-primary min-w-[140px]"
                                        disabled={loadingStates.allocateShares}
                                    >
                                        {#if loadingStates.allocateShares}
                                            Allocating<LoadingDots />
                                        {:else}
                                            Allocate Shares
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Deallocate Shares Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleDeallocateShares}>
                                <h3 class="section-header">Deallocate Shares</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="flex flex-col gap-3">
                                    <input 
                                        type="text" 
                                        bind:value={adminForms.deallocateShares.ownerAddress}
                                        placeholder="Owner Address"
                                        class="input w-full"
                                        disabled={loadingStates.deallocateShares}
                                    />
                                    {#if errorStates.deallocateShares}
                                        <div class="text-(--destructive)">{errorStates.deallocateShares}</div>
                                    {/if}
                                    <div class="flex justify-end">
                                        <button 
                                            type="submit"
                                            class="btn-secondary min-w-[140px]"
                                            disabled={loadingStates.deallocateShares}
                                        >
                                            {#if loadingStates.deallocateShares}
                                                Deallocating<LoadingDots />
                                            {:else}
                                                Deallocate Shares
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Change Max Shares Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleChangeMaxShares}>
                                <h3 class="section-header">Change Max Shares</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="flex flex-col gap-3">
                                    <input 
                                        type="number" 
                                        bind:value={adminForms.changeMaxShares.newMax}
                                        placeholder="New Maximum Shares"
                                        class="input w-full"
                                        disabled={loadingStates.changeMaxShares}
                                    />
                                    {#if errorStates.changeMaxShares}
                                        <div class="text-(--destructive)">{errorStates.changeMaxShares}</div>
                                    {/if}
                                    <div class="flex justify-end">
                                        <button 
                                            type="submit"
                                            class="btn-primary min-w-[140px]"
                                            disabled={loadingStates.changeMaxShares}
                                        >
                                            {#if loadingStates.changeMaxShares}
                                                Updating<LoadingDots />
                                            {:else}
                                                Update Max Shares
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Add Company Data Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleAddCompanyData}>
                                <h3 class="section-header">Add Company Data</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="number" 
                                        bind:value={adminForms.addCompanyData.maxShares}
                                        placeholder="Max Shares"
                                        class="input w-full"
                                        disabled={loadingStates.addCompanyData}
                                    />
                                    <input 
                                        type="number" 
                                        bind:value={adminForms.addCompanyData.registryNumber}
                                        placeholder="Registry Number"
                                        class="input w-full"
                                        disabled={loadingStates.addCompanyData}
                                    />
                                </div>
                                {#if errorStates.addCompanyData}
                                    <div class="text-(--destructive)">{errorStates.addCompanyData}</div>
                                {/if}
                                <div class="flex justify-end">
                                    <button 
                                        type="submit"
                                        class="btn-primary min-w-[140px]"
                                        disabled={loadingStates.addCompanyData}
                                    >
                                        {#if loadingStates.addCompanyData}
                                            Adding<LoadingDots />
                                        {:else}
                                            Add Company Data
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Change Admin Form -->
                        <div class="card mb-2">
                            <form class="space-y-4" onsubmit={handleChangeAdmin}>
                                <h3 class="section-header">Change Admin</h3>
                                <div class="border-b border-(--border) mb-4"></div>
                                <div class="flex flex-col gap-3">
                                    <input 
                                        type="text" 
                                        bind:value={adminForms.changeAdmin.newAdminAddress}
                                        placeholder="New Admin Address"
                                        class="input w-full"
                                        disabled={loadingStates.changeAdmin}
                                    />
                                    {#if errorStates.changeAdmin}
                                        <div class="text-(--destructive)">{errorStates.changeAdmin}</div>
                                    {/if}
                                    <div class="flex justify-end">
                                        <button 
                                            type="submit"
                                            class="btn-primary min-w-[140px]"
                                            disabled={loadingStates.changeAdmin}
                                        >
                                            {#if loadingStates.changeAdmin}
                                                Changing<LoadingDots />
                                            {:else}
                                                Change Admin
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                {/if}
            {/if}
            
            <!-- Direct Share Transfer Section (Admin Function) -->
            <div class="card mb-2">
                <h3 class="section-header">Send Allocated Shares
                    <HelpTip text="Send shares that have been allocated to a designated wallet address (admin function)" />
                </h3>
                <div class="border-b border-(--border) mb-4"></div>
                <form class="space-y-3" onsubmit={(e) => handleClaimSharesDirect(e)}>
                    <input 
                        type="text" 
                        class="input w-full"
                        placeholder="Enter destination wallet address"
                        bind:value={userForms.claimSharesDirect.destination_address}
                        disabled={loadingStates.claimSharesDirect}
                    />
                    {#if errorStates.claimSharesDirect}
                        <div class="text-(--destructive)">{errorStates.claimSharesDirect}</div>
                    {/if}
                    <div class="flex justify-end">
                        <button 
                            type="submit"
                            class="btn-primary min-w-[140px]"
                            disabled={loadingStates.claimSharesDirect}
                        >
                            {#if loadingStates.claimSharesDirect}
                                Sending<LoadingDots />
                            {:else}
                                Send Shares
                            {/if}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    {/if}
</div>