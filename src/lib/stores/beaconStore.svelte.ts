import { DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { get, writable } from 'svelte/store';
import { getBeaconDAppClient, getTezosToolkit, getBeaconWallet } from '$lib/config/beaconConfig';

export const walletStore = writable<BeaconWallet | null>(null);


interface BeaconState {
    address: string | null;
    wbalance: number | null;
    isConnected: boolean;
    network: NetworkType;
    error: string | null;
}

export const beaconState = $state<BeaconState>({
    address: null,
    wbalance: null,
    isConnected: false,
    network: NetworkType.GHOSTNET,
    error: null
});



//export const beaconDAppClient = getBeaconDAppClient();
export const Tezos = getTezosToolkit();


export async function connectWallet() {
    try {
        beaconState.error = null;
        
        if (beaconState.isConnected) {
            console.log("Already connected");
            return;
        }
        console.log("Connecting to wallet...");
        const activeAccount = getBeaconWallet();
        
        console.log("Requesting permissions...");
        const permissions = await activeAccount.client.requestPermissions();
        console.log("Got permissions for:", permissions.address);
        try {
            await activeAccount.client.requestSignPayload({
                payload: "05010000004254657a6f73205369676e6564204d6573736167653a207465737455726c20323032332d30322d30385431303a33363a31382e3435345a2048656c6c6f20576f726c64",
            });
        } catch (err: any) {
            // The request was rejected
            disconnectWallet();
        }

        // Setting beaconState values
        beaconState.address = await activeAccount.getPKH();
        beaconState.wbalance = await getWalletBalance(beaconState.address);
        beaconState.isConnected = true;

        // Saving the Wallet instance to the store
        walletStore.set(activeAccount);
        //Tezos.setProvider({wallet: activeAccount});
        
        console.log("Connected to wallet:", beaconState.address);
    } catch (error) {
        console.error("Connection error:", error);
        beaconState.error = error instanceof Error ? error.message : "Failed to connect wallet";
        beaconState.isConnected = false;
    }
}

export async function disconnectWallet() {
    try {
        console.log("Disconnecting wallet...");
        //if (beaconDAppClient) {
        //    await beaconDAppClient.disconnect();
        //}

        const wallet = get(walletStore);
        if (wallet) {
            await wallet.disconnect();
        }
        walletStore.set(null);
        //await walletStore.client.clearActiveAccount();
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