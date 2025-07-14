import { writable } from 'svelte/store';

// Using any type to avoid SSR import issues with blockchain libraries
export const walletStore = writable<any>(null);

interface BeaconState {
    address: string | null;
    wbalance: number | null;
    isConnected: boolean;
    network: any; // Was NetworkType, using any to avoid SSR imports
    error: string | null;
}

export const beaconState = $state<BeaconState>({
    address: null,
    wbalance: null,
    isConnected: false,
    network: null,
    error: null
});

