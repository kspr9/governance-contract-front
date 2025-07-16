import { writable } from 'svelte/store';

/**
 * A writable store that holds the state for the main view on the homepage.
 * - true:  Show the ContractLoader and related components.
 * - false: Show the CreateCompany component.
 */
export const showContractLoaderStore = writable<boolean>(true);
