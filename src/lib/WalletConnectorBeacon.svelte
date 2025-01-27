<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import { BeaconEvent, SigningType } from '@airgap/beacon-sdk';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { getBeaconWallet, Tezos, wallet } from './config/beaconConfig';

    export const tezSym: string = 'ꜩ';

    

    //export const beaconDAppClient = getBeaconDAppClient();

    onMount(async () => {
        // Check for existing connection first, don't prompt if already connected
        if (await checkExistingConnection()) {
            return;
        } else {
            beaconState.isConnected = false;
        }
    });

    onDestroy(() => {
        try {
            disconnectWallet();
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
        }
    });


    export async function connectWallet() {
        beaconState.error = null;

        if (beaconState.isConnected) {
            console.log("Already connected");
            return;
        }

        Tezos.setWalletProvider(wallet);

        wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            // An active account has been set
            console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
            
            if (!account) {
                return;
            }
            
            beaconState.address = account.address;
            beaconState.isConnected = true;
        });
        try {
            console.log("Connecting to wallet...");
            const activeAccount = wallet
            
            console.log("Requesting permissions...");
            const permissions = await activeAccount.client.requestPermissions();
            console.log("Got permissions for:", permissions.address);
            try {
                await activeAccount.client.requestSignPayload({
                    signingType: SigningType.RAW,
                    //payload: "05010000004254657a6f73205369676e6564204d6573736167653a207465737455726c20323032332d30322d30385431303a33363a31382e3435345a2048656c6c6f20576f726c64",
                    payload: "This is SPARTA",

                })
                .then((response) => {
                    console.log("Signature:", response.signature);
                });
                // Setting beaconState values
                beaconState.isConnected = true;
                beaconState.address = await activeAccount.getPKH();
                beaconState.wbalance = await getWalletBalance(beaconState.address);
                beaconState.isConnected = true;
                
                // Saving the Wallet instance to the store
                walletStore.set(activeAccount);
                
                console.log("Connected to wallet:", beaconState.address);

            } catch (err: any) {
                // The request was rejected
                disconnectWallet();
            }

        } catch (error) {
            console.error("Connection error:", error);
            disconnectWallet();
            beaconState.error = error instanceof Error ? error.message : "Failed to connect wallet";
        }

        
        
    }

    export async function disconnectWallet() {
        console.log("Disconnecting wallet...");
        Tezos.setWalletProvider(wallet);
        try {
            await wallet.client.clearActiveAccount();
            await wallet.disconnect();

            walletStore.set(null);
            
            console.log("Wallet disconnected");
            beaconState.address = null;
            beaconState.isConnected = false;
            beaconState.error = null;
            
            
        } catch (error) {
            console.error("Disconnection error:", error);
            beaconState.error = error instanceof Error ? error.message : "Failed to disconnect wallet";
        }
    }

    export async function checkExistingConnection() {
        try {
            const activeAccount = await getBeaconWallet().client.getActiveAccount();
            if (activeAccount) {
                beaconState.address = activeAccount.address;
                beaconState.isConnected = true;
                console.log("Found existing connection:", activeAccount.address);
                beaconState.wbalance = await getWalletBalance(beaconState.address);

                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error checking existing connection:", error);
            beaconState.error = error instanceof Error ? error.message : "Failed to check wallet connection";
        }
        return false;
    }

    // get balance
    export async function getWalletBalance(address: string) {
        const balance = await Tezos.tz.getBalance(address);
        beaconState.wbalance =  balance.toNumber() / 1000000;
        console.log("Balance:", balance.toNumber() / 1000000);
        return balance.toNumber() / 1000000;
    }

</script>

<div class="container mx-auto p-4 bg-gray-100 rounded-md">
    <h2 class="text-2xl font-bold mb-4">Wallet Information</h2>
    {#if beaconState.error}
        <div class="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {beaconState.error}
        </div>
    {/if}

    {#if beaconState.isConnected}
        <div class="grid grid-cols-5 gap-4">
            <div class="col-span-4">
                <span class="font-semibold">Address:</span>
                <span class="font-mono">{beaconState.address}</span> 
            </div>
            <div class="flex justify-end">
                <span class="font-semibold">Balance:</span>
                <span>{beaconState.wbalance} {tezSym}</span>
            </div>
            
            <button 
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onclick={disconnectWallet}
            >
                Disconnect
            </button>
        </div>
    {:else}
        <button 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onclick={connectWallet}
        >
            Connect Wallet
        </button>
    {/if}
</div>