<script lang="ts">
    import { contractState, contractInstance } from './stores/contractStore.svelte';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { get } from "svelte/store";
    import { Tezos, wallet, resetProvider } from './config/beaconConfig';
    import { loadContractTzkt } from './utils/contractLoader';


    const isAdmin = $derived(
        beaconState.address !== null && 
        tzktStorageData.admin_address !== null && 
        beaconState.address === tzktStorageData.admin_address
    );
 

    // Form states
    let adminForms = $state({
        addShareOwner: { amount: '', ownerAddress: '' },
        changeMaxShares: { newMax: '' },
        issueShares: { amount: '' },
        addCompanyData: {
            allSharesIssued: false,
            issuedShares: '',
            maxShares: '',
            registryNumber: ''
        },
        changeAdmin: { newAdminAddress: '' },
        removeShareOwner: { ownerAddress: '' }
    });
    
    let userForms = $state({
        transferShares: { amount: '', destination: '', share: '' },
        claimShares: { address: '' }
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
    async function handleAddShareOwner(event: Event) {
        event.preventDefault();
        try {
            
            await resetProvider();
  
            const operation = await $contractInstance.methodsObject.add_share_owner(
                adminForms.addShareOwner.amount,
                adminForms.addShareOwner.ownerAddress
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Share owner added successfully", op);
            });

            adminForms.addShareOwner.amount = '';
            adminForms.addShareOwner.ownerAddress = '';
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

        } catch (error) {
            console.error("Failed to add share owner:", error);
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

            adminForms.changeMaxShares.newMax = '';
            
        } catch (error) {
            console.error("Failed to change max shares:", error);
            throw error;
        }
    }

    async function handleIssueShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.issue_shares_unclaimed2(
                adminForms.issueShares.amount
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Shares issued successfully", op);
            });

            adminForms.issueShares.amount = '';
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to issue shares:", error);
            throw error;
        }
    }

    // User Functions
    async function handleTransferShares(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.transfer_shares(
                userForms.transferShares.amount,
                userForms.transferShares.destination,
                userForms.transferShares.share
            ).send();

            await operation.confirmation(2)
            .then((op: any) => {
                console.log("Shares transferred successfully", op);
            });

            userForms.transferShares = { amount: '', destination: '', share: '' };
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();
        } catch (error) {
            console.error("Failed to transfer shares:", error);
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

    // New admin functions
    async function handleAddCompanyData(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methodsObject.add_company_data({
                all_shares_issued: adminForms.addCompanyData.allSharesIssued,
                issued_shares: adminForms.addCompanyData.issuedShares,
                max_shares: adminForms.addCompanyData.maxShares,
                registry_number: adminForms.addCompanyData.registryNumber
            }).send();

            await operation.confirmation(2);
            console.log("Company data added successfully", operation);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.addCompanyData = {
                allSharesIssued: false,
                issuedShares: '',
                maxShares: '',
                registryNumber: ''
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

    async function handleRemoveShareOwner(event: Event) {
        event.preventDefault();
        try {
            await resetProvider();

            const operation = await $contractInstance.methods.remove_share_owner(
                adminForms.removeShareOwner.ownerAddress
            ).send();

            await operation.confirmation(2);
            console.log("Share owner removed successfully", operation);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            await loadContractTzkt();

            adminForms.removeShareOwner.ownerAddress = '';
        } catch (error) {
            console.error("Failed to remove share owner:", error);
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
    {#if $contractInstance}
        <div class="p-4 space-y-6">
            {#if isAdmin}
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h2 class="text-2xl font-bold mb-4">Admin Functions</h2>
                    
                    <!-- Add Share Owner Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleAddShareOwner}>
                        <h3 class="text-xl font-semibold">Add Share Owner</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <input 
                                type="number" 
                                bind:value={adminForms.addShareOwner.amount}
                                placeholder="Amount"
                                class="p-2 border rounded"
                            />
                            <input 
                                type="text" 
                                bind:value={adminForms.addShareOwner.ownerAddress}
                                placeholder="Owner Address"
                                class="p-2 border rounded"
                            />
                        </div>
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Owner
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
                    <form class="space-y-4" onsubmit={handleIssueShares}>
                        <h3 class="text-xl font-semibold">Issue Shares</h3>
                        <input 
                            type="number" 
                            bind:value={adminForms.issueShares.amount}
                            placeholder="Amount to Issue"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Issue Shares
                        </button>
                    </form>

                    <!-- Add Company Data Form -->
                    <form class="mb-4 space-y-4" onsubmit={handleAddCompanyData}>
                        <h3 class="text-xl font-semibold">Add Company Data</h3>
                        <input 
                            type="text" 
                            bind:value={adminForms.addCompanyData.issuedShares}
                            placeholder="Issued Shares"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={adminForms.addCompanyData.maxShares}
                            placeholder="Max Shares"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
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
                    <form class="space-y-4" onsubmit={handleRemoveShareOwner}>
                        <h3 class="text-xl font-semibold">Remove Share Owner</h3>
                        <input 
                            type="text" 
                            bind:value={adminForms.removeShareOwner.ownerAddress}
                            placeholder="Owner Address"
                            class="p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Remove Share Owner
                        </button>
                    </form>
                </div>
            {/if}

            <div class="bg-green-50 p-4 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">User Functions</h2>
                
                <!-- Transfer Shares Form -->
                <form class="mb-4 space-y-4" onsubmit={handleTransferShares}>
                    <h3 class="text-xl font-semibold">Transfer Shares</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <input 
                            type="number" 
                            bind:value={userForms.transferShares.amount}
                            placeholder="Amount"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={userForms.transferShares.destination}
                            placeholder="Destination Address"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={userForms.transferShares.share}
                            placeholder="Share Address"
                            class="p-2 border rounded"
                        />
                    </div>
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Transfer Shares
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
            </div>
        </div>
    {:else if beaconState.isConnected}
        <div class="p-4">
            <button 
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onclick={connectContract}
            >
                Connect to Contract
            </button>
        </div>
    {:else}
        <div class="p-4 text-gray-600">
            Please connect your wallet first to interact with the contract.
        </div>
    {/if}
</div>