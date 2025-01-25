import { DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { get, writable } from 'svelte/store';
import { getBeaconClient, getTezosToolkit } from '$lib/config/beaconConfig';

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

const options: DAppClientOptions = {
    name: 'TokenshareBeaconDApp',
    iconUrl: 'https://taquito.io/img/favicon.svg',
    network: { type: beaconState.network },
    enableMetrics: true,
};

const rpcUrl_teztnets = "https://rpc.ghostnet.teztnets.com";
const rpcUrl_smartpy = "https://ghostnet.smartpy.io";
const rpcUrl_tzkt = " https://rpc.tzkt.io/ghostnet";


export const beaconClient = getBeaconClient();
export const Tezos = getTezosToolkit();


export async function connectWallet() {
    try {
        beaconState.error = null;
        console.log("Requesting permissions...");
        
        if (beaconState.isConnected) {
            return;
        }
        console.log("Creating a new BeaconWallet instance");
        const newWallet = new BeaconWallet({ 
            name: "TokenShare Beacon Wallet", 
            preferredNetwork: beaconState.network 
        });

        await newWallet.requestPermissions();
        beaconState.address = await newWallet.getPKH();

        // NOTE: Trying out Wallet instance VS DAppClient instance
        // NOTE: Might still need to request permissions using DAppClient instance
        //const permissions = await beaconClient.requestPermissions(options);

        const balance = await Tezos.tz.getBalance(beaconState.address);
        
        //beaconState.wbalance = balance.toNumber() / 1000000;
        beaconState.wbalance = Number(balance.div(1000000).toFormat(2));
        //beaconState.address = permissions.address;
        beaconState.isConnected = true;
        walletStore.set(newWallet);
        

        console.log("Connected to wallet:", beaconState.address);
    } catch (error) {
        console.error("Connection error:", error);
        beaconState.error = error instanceof Error ? error.message : "Failed to connect wallet";
        beaconState.isConnected = false;
    }
}

export async function disconnectWallet() {
    try {
        await beaconClient.disconnect();

        const wallet = get(walletStore);
        if (wallet) {
            await wallet.clearActiveAccount();
        }
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
        const activeAccount = await beaconClient.getActiveAccount();
        if (activeAccount) {
            beaconState.address = activeAccount.address;
            beaconState.isConnected = true;
            console.log("Found existing connection:", activeAccount.address);
            const balance = await Tezos.tz.getBalance(beaconState.address);
            beaconState.wbalance = balance.toNumber() / 1000000;

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