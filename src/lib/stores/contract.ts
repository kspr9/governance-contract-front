import { writable } from 'svelte/store';

interface ContractState {
    contractAddress: string | null;
}

export const contractState = writable<ContractState>({
    contractAddress: null
});