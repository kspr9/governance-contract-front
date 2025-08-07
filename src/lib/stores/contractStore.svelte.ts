import { writable } from 'svelte/store';

interface ContractState {
    contractAddress: string | null;
    isLoaded: boolean;
}

export const contractState = writable<ContractState>({
    contractAddress: null,
    isLoaded: false
});

// Using any type to avoid SSR import issues with @taquito/taquito
export const contractInstance = writable<any>(null); 


