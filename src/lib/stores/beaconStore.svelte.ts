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

