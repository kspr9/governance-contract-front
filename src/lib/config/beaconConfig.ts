import { type AccountInfo, DAppClient, type DAppClientOptions, NetworkType, BeaconEvent } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { walletStore } from '$lib/stores/beaconStore.svelte';
import { beaconState } from '$lib/stores/beaconStore.svelte';

const rpcUrl_teztnets = "https://rpc.ghostnet.teztnets.com";
const rpcUrl_smartpy = "https://ghostnet.smartpy.io";
const rpcUrl_tzkt = "https://rpc.tzkt.io/ghostnet";
const rpcUrl_mainnet = "https://rpc.tzkt.io/mainnet";
const SELECTED_RPC_URL = rpcUrl_mainnet;

// Singleton instances
export const Tezos = new TezosToolkit(SELECTED_RPC_URL);
export const wallet = new BeaconWallet({ 
    name: "Tokenshare Beacon Wallet", 
    preferredNetwork: NetworkType.MAINNET 
});

Tezos.setWalletProvider(wallet);
walletStore.set(wallet);

// Subscribe to ACTIVE_ACCOUNT_SET to keep app state in sync with wallet
wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
    console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account?.address);
    if (account) {
        beaconState.address = account.address;
        beaconState.isConnected = true;
        beaconState.wbalance = await getWalletBalance(account.address);
    } else {
        beaconState.address = null;
        beaconState.isConnected = false;
        beaconState.wbalance = null;
    }
});

// Helper: get active account
export async function getActiveAccount(): Promise<AccountInfo | undefined> {
    try {
        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount) {
            Tezos.setWalletProvider(wallet);
            return activeAccount;
        }
        return undefined;
    } catch (error) {
        console.error("Error getting active account:", error);
        return undefined;
    }
}

// Helper: connect wallet
export async function connectWallet() {
    // Only request permissions if not already connected
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
        return activeAccount;
    }
    const permissions = await wallet.client.requestPermissions();
    Tezos.setWalletProvider(wallet);
    walletStore.set(wallet);
    return permissions;
}

// Helper: disconnect wallet
export async function disconnectWallet() {
    await wallet.client.clearActiveAccount();
    walletStore.set(null);
}

// Helper: get balance
export async function getWalletBalance(address: string) {
    const balance = await Tezos.tz.getBalance(address);
    return balance.toNumber() / 1000000;
}

export async function resetProvider() {
    // First disconnect existing provider if any
    Tezos.setProvider({ rpc: SELECTED_RPC_URL });
    // Then set wallet provider again
    Tezos.setWalletProvider(wallet);
}
