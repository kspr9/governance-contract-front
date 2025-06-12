import { writable } from 'svelte/store';
import type { ContractAbstraction, Wallet } from '@taquito/taquito';

interface ContractState {
    contractAddress: string | null;
    isLoaded: boolean;
}

export const contractState = writable<ContractState>({
    contractAddress: null,
    isLoaded: false
});

// Using any type for now to avoid type conflicts with ContractOps
export const contractInstance = writable<any>(null);
//export const contractInstance = writable<ContractAbstraction<Wallet> | null>(null); 


