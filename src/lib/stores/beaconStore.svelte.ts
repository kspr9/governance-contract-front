import { NetworkType } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { writable } from 'svelte/store';


export const walletStore = writable<BeaconWallet | null>(null);


interface BeaconState {
    address: string | null;
    wbalance: number | null;
    isConnected: boolean;
    network: NetworkType | null;
    error: string | null;
}

export const beaconState = $state<BeaconState>({
    address: null,
    wbalance: null,
    isConnected: false,
    network: null,
    error: null
});

