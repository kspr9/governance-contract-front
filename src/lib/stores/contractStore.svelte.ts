import { writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';


interface ContractState {
    contractAddress: string | null;
}

export const contractState = writable<ContractState>({
    contractAddress: null
});

export const contractInstance = writable<any>(null);

