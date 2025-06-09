<script lang="ts">
    import { contractState, contractInstance } from './stores/contractStore.svelte';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { get } from "svelte/store";
    import { Tezos, wallet, resetProvider } from './config/beaconConfig';
    import { loadContractTzkt } from './utils/contractLoader';

    // TODO: add a loading visual to appear each time when an entrypoint is called but result is not yet received
    // clearly indicate that process is ongoing.
    // notify the user with the result - e.g. "Shares allocated successfully" or "Shares minted successfully"
    
    const isAdmin = $derived(
        beaconState.address !== null && 
        tzktStorageData.admin_address !== null && 
        beaconState.address === tzktStorageData.admin_address
    );
 

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
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
            
        } catch (error) {
            console.error("Failed to allocate shares:", error);
            errorStates.allocateShares = error instanceof Error ? error.message : "Failed to allocate shares";
        } finally {
            loadingStates.allocateShares = false;
        }
    }

    async function handleChangeMaxShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.change_max_shares(
                adminForms.changeMaxShares.newMax
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Max shares updated successfully", op);
            });

            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.changeMaxShares.newMax = null;
            
        } catch (error) {
            console.error("Failed to change max shares:", error);
            throw error;
        }
    }

    async function handleMintShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.mint_shares_to_pool(
                adminForms.mintShares.amount
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Shares minted successfully", op);
            });

            adminForms.mintShares.amount = null;
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to mint shares:", error);
            throw error;
        }
    }

    // User Functions
    async function handleTransferHeldShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methodsObject.transfer_held_shares({
                amount: userForms.transferHeldShares.amount,
                destination: userForms.transferHeldShares.destination,
                share: userForms.transferHeldShares.share
            }).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Held shares transferred successfully", op);
            });

            userForms.transferHeldShares = { amount: null, destination: '', share: '' };
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to transfer held shares:", error);
            throw error;
        }
    }

    async function handleClaimShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();            

            const operation = await $contractInstance.methods.claim_shares(
                userForms.claimShares.address
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Shares claimed successfully", op);
            });

            userForms.claimShares.address = '';
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to claim shares:", error);
            throw error;
        }
    }

    // New User Function: Direct Claim Shares
    async function handleClaimSharesDirect(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.claim_shares_direct({
                destination_address: userForms.claimSharesDirect.destination_address
            }).send();

            await operation.confirmation(2).then((op: any) => {
                console.log("Direct claim of shares successful", op);
            });

            // Reset the direct claim form
            userForms.claimSharesDirect.destination_address = '';
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to claim shares directly:", error);
            throw error;
        }
    }

    // New admin functions
    async function handleAddCompanyData(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methodsObject.add_company_data({
                max_shares: adminForms.addCompanyData.maxShares,
                registry_number: adminForms.addCompanyData.registryNumber
            }).send();

            await operation.confirmation(2);
            console.log("Company data added successfully", operation);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.addCompanyData = {
                maxShares: null,
                registryNumber: null
            };
        } catch (error) {
            console.error("Failed to add company data:", error);
            throw error;
        }
    }

    async function handleChangeAdmin(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.change_admin(
                adminForms.changeAdmin.newAdminAddress
            ).send();

            await operation.confirmation(2);
            console.log("Admin changed successfully", operation);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.changeAdmin.newAdminAddress = '';
        } catch (error) {
            console.error("Failed to change admin:", error);
            throw error;
        }
    }

    async function handleDeallocateShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.deallocate_shares_from_claimants(
                adminForms.deallocateShares.ownerAddress
            ).send();

            await operation.confirmation(2);
            console.log("Shares deallocated successfully", operation);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.deallocateShares.ownerAddress = '';
        } catch (error) {
            console.error("Failed to deallocate shares:", error);
            throw error;
        }
    }

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
    <!-- Always visible Connect to Contract section -->
    <div class="p-4">
        <button 
            onclick={connectContract}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            { $contractInstance ? "Reconnect to Contract" : "Connect to Contract" }
        </button>
        {#if $contractState.contractAddress}
            <div class="mt-2 text-sm">
                Contract Address: {$contractState.contractAddress}
            </div>
        {/if}
    </div>

    <!-- Provide user feedback if wallet is not connected -->
    {#if !beaconState.isConnected}
        <div class="p-4 text-gray-600">
            Please connect your wallet first to interact with the contract.
        </div>
    {/if}

    <!-- Display operations forms if a contract is connected and wallet is connected -->
    {#if $contractInstance && beaconState.isConnected}
        <div class="p-4 space-y-6">
            {#if isAdmin}
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h2 class="text-2xl font-bold mb-4">Admin Functions</h2>
                    
                    <!-- Add Share Owner Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleAllocateShares}>
                        <h3 class="text-xl font-semibold">Allocate Shares to Claimant</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <input 
                                type="number" 
                                bind:value={adminForms.allocateShares.amount}
                                placeholder="Amount"
                                class="p-2 border rounded"
                                disabled={loadingStates.allocateShares}
                            />
                            <input 
                                type="text" 
                                bind:value={adminForms.allocateShares.ownerAddress}
                                placeholder="Owner Address"
                                class="p-2 border rounded"
                                disabled={loadingStates.allocateShares}
                            />
                        </div>
                        {#if errorStates.allocateShares}
                            <div class="text-red-500 text-sm">{errorStates.allocateShares}</div>
                        {/if}
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            disabled={loadingStates.allocateShares}
                        >
                            {loadingStates.allocateShares ? 'Allocating...' : 'Allocate Shares'}
                        </button>
                    </form>

                    <!-- Change Max Shares Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleChangeMaxShares}>
                        <h3 class="text-xl font-semibold">Change Max Shares</h3>
                        <input 
                            type="number" 
                            bind:value={adminForms.changeMaxShares.newMax}
                            placeholder="New Maximum Shares"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Update Max Shares
                        </button>
                    </form>

                    <!-- Issue Shares Form -->
                    <form class="space-y-4" onsubmit={handleMintShares}>
                        <h3 class="text-xl font-semibold">Mint Shares to Pool</h3>
                        <input 
                            type="number" 
                            bind:value={adminForms.mintShares.amount}
                            placeholder="Amount to Mint"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Mint Shares
                        </button>
                    </form>

                    <!-- Add Company Data Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleAddCompanyData}>
                        <h3 class="text-xl font-semibold">Add Company Data</h3>
                        <input 
                            type="number" 
                            bind:value={adminForms.addCompanyData.maxShares}
                            placeholder="Max Shares"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="number" 
                            bind:value={adminForms.addCompanyData.registryNumber}
                            placeholder="Registry Number"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Company Data
                        </button>
                    </form>

                    <!-- Change Admin Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleChangeAdmin}>
                        <h3 class="text-xl font-semibold">Change Admin</h3>
                        <input 
                            type="text" 
                            bind:value={adminForms.changeAdmin.newAdminAddress}
                            placeholder="New Admin Address"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Change Admin
                        </button>
                    </form>

                    <!-- Remove Share Owner Form -->
                    <form class="space-y-4" onsubmit={handleDeallocateShares}>
                        <h3 class="text-xl font-semibold">Deallocate Shares</h3>
                        <input 
                            type="text" 
                            bind:value={adminForms.deallocateShares.ownerAddress}
                            placeholder="Owner Address"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Deallocate Shares
                        </button>
                    </form>
                </div>
            {/if}

            <div class="bg-green-50 p-4 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">User Functions</h2>
                
                <!-- Transfer Shares Form -->
                <form class="mb-4 space-y-4" onsubmit={handleTransferHeldShares}>
                    <h3 class="text-xl font-semibold">Transfer Held Shares</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <input 
                            type="number" 
                            bind:value={userForms.transferHeldShares.amount}
                            placeholder="Amount"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={userForms.transferHeldShares.destination}
                            placeholder="Destination Address"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={userForms.transferHeldShares.share}
                            placeholder="Share Address"
                            class="p-2 border rounded"
                        />
                    </div>
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Transfer Held Shares
                    </button>
                </form>

                <!-- Claim Shares Form -->
                <form class="space-y-4" onsubmit={handleClaimShares}>
                    <h3 class="text-xl font-semibold">Claim Shares</h3>
                    <input 
                        type="text" 
                        bind:value={userForms.claimShares.address}
                        placeholder="Address"
                        class="p-2 border rounded"
                    />
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Claim Shares
                    </button>
                </form>

                <!-- Direct Claim Shares Form -->
                <form class="space-y-4" onsubmit={handleClaimSharesDirect}>
                    <h3 class="text-xl font-semibold">Direct Claim Shares</h3>
                    <input 
                        type="text" 
                        bind:value={userForms.claimSharesDirect.destination_address}
                        placeholder="Destination Address"
                        class="p-2 border rounded"
                    />
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Direct Claim Shares
                    </button>
                </form>
            </div>
        </div>
    {/if}
</div>