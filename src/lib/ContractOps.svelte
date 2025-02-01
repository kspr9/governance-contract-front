<script lang="ts">
    import { onMount } from "svelte";
    import { contractState, contractInstance } from './stores/contractStore.svelte';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { get, writable } from "svelte/store";
    import { Tezos, wallet } from "./config/beaconConfig";
    import { BeaconEvent, SigningType } from "@airgap/beacon-sdk";


    const isAdmin = $derived(
        beaconState.address !== null && 
        tzktStorageData.admin_address !== null && 
        beaconState.address === tzktStorageData.admin_address
    );
 

    // Form states
    let adminForms = $state({
        addShareOwner: { amount: '', ownerAddress: '' },
        changeMaxShares: { newMax: '' },
        issueShares: { amount: '' }
    });
    
    let userForms = $state({
        transferShares: { amount: '', destination: '', share: '' },
        claimShares: { address: '' }
    });

    let signature: string | null;

    async function connectContract() {
        try {
            
            console.log("Wallet ready for contract:", await wallet.getPKH());
        
            Tezos.setWalletProvider(wallet);

            if (!$contractState.contractAddress) {
                throw new Error("Contract address not set");
            }
            if (!beaconState.isConnected) {
                throw new Error("Wallet not connected");
            }
            await Tezos.contract.at($contractState.contractAddress)
            .then((contract: any) => {
                console.log("Contract connected successfully", contract);
                contractInstance.set(contract);
            });
            
        } catch (error) {
            console.error("Failed to load contract:", error);
            throw error;
        }
    }



    // Admin Functions
    async function handleAddShareOwner(event: Event) {
        event.preventDefault();
        try {

            await wallet.client.requestPermissions();
            Tezos.setProvider({wallet});   
            const operation = await $contractInstance.methodsObject.add_share_owner(
                adminForms.addShareOwner.amount,
                adminForms.addShareOwner.ownerAddress
            ).send();
            await operation.confirmation()
            .then((op: any) => {
                console.log("Share owner added successfully", op);
            });
        } catch (error) {
            console.error("Failed to add share owner:", error);
        }
    }

    async function handleChangeMaxShares(event: Event) {
        event.preventDefault();
        try {
            console.log("Try block");
            Tezos.setProvider({wallet});
            wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
                // An active account has been set
                console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
                
                if (!account) {
                    return;
                }
                
                beaconState.address = account.address;
                beaconState.isConnected = true;
                console.log("Connecting to wallet...");
                const activeAccount = wallet
                
                console.log("Requesting permissions...");
                const permissions = async () => {
                    await activeAccount.client.requestPermissions()
                    .then((permissions) => {
                        console.log("Got permissions for:", permissions.address);
                    })
                    .then(async () => {
                        console.log("Requesting signature...");
                        await activeAccount.client.requestSignPayload({
                            signingType: SigningType.RAW,
                            payload: "This is SPARTA",
                        })
                        .then((response) => {
                            console.log("Signature:", response.signature);
                            signature = response.signature;
                        });
                    })
                    .then((permissions: any) => {
                        console.log("Permissions:", permissions);
                    });

                    Tezos.setProvider({wallet});
                    
                    const operation = await $contractInstance.methods.change_max_shares(
                        adminForms.changeMaxShares.newMax
                    ).send();
                    await operation.confirmation()
                    .then((op: any) => {
                        console.log("Max shares updated successfully", op);
                    });
                    adminForms.changeMaxShares.newMax = '';
                }
            });


    
        } catch (error) {
            console.error("Failed to change max shares:", error);
            throw error;
        }
    }

    async function handleIssueShares(event: Event) {
        event.preventDefault();
        try {
            
            
            Tezos.setWalletProvider(wallet);
            const operation = await $contractInstance.methods.issue_shares_unclaimed2(
                adminForms.issueShares.amount
            ).send();
            await operation.confirmation()
            .then((op: any) => {
                console.log("Shares issued successfully", op);
            });
            adminForms.issueShares.amount = '';
        } catch (error) {
            console.error("Failed to issue shares:", error);
            throw error;
        }
    }

    // User Functions
    async function handleTransferShares(event: Event) {
        event.preventDefault();
        try {
            
            console.log("Wallet:", wallet?.getPKH());
        
            Tezos.setProvider({wallet});

            const operation = await $contractInstance.methods.transfer_shares(
                userForms.transferShares.amount,
                userForms.transferShares.destination,
                userForms.transferShares.share
            ).send();
            await operation.confirmation()
            .then((op: any) => {
                console.log("Shares transferred successfully", op);
            });
            userForms.transferShares = { amount: '', destination: '', share: '' };
        } catch (error) {
            console.error("Failed to transfer shares:", error);
            throw error;
        }
    }

    async function handleClaimShares(event: Event) {
        event.preventDefault();
        try {
            
            console.log("Wallet:", wallet?.getPKH());
        
            Tezos.setProvider({wallet});

            const operation = await $contractInstance.methods.claim_shares(
                userForms.claimShares.address
            ).send();
            await operation.confirmation()
            .then((op: any) => {
                console.log("Shares claimed successfully", op);
            });
            userForms.claimShares.address = '';
        } catch (error) {
            console.error("Failed to claim shares:", error);
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