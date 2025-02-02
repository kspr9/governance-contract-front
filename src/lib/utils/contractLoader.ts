import { contractState } from '../stores/contractStore.svelte';
import { tzktStorageData } from '../stores/tzktStorage.svelte';
import { get } from 'svelte/store';

interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

// These will be returned by the function instead of using global variables
interface ContractEntries {
    ownersMapEntries: [string, string][];
    unclaimedSharesEntries: [string, TzktTicket][];
    shareBalancesEntries: [string, TzktTicket][];
}

interface TzktStorageData {
    owners_map: Record<string, string>;
    issued_unclaimed_shares2: Record<string, TzktTicket>;
    share_balances: Record<string, TzktTicket>;
    max_shares: string;
    admin_address: string;
    issued_shares: string;
}

export async function loadContractTzkt(): Promise<ContractEntries> {
    try {
        const response = await fetch(`https://api.ghostnet.tzkt.io/v1/contracts/${get(contractState).contractAddress}/storage`);
        const data = await response.json() as TzktStorageData;
        
        // Update all properties
        Object.assign(tzktStorageData, data);

        // Process and return entries with proper type assertions
        const entries: ContractEntries = {
            ownersMapEntries: Object.entries(data.owners_map ?? {}),
            unclaimedSharesEntries: Object.entries(data.issued_unclaimed_shares2 ?? {}),
            shareBalancesEntries: Object.entries(data.share_balances ?? {})
        };

        // Log just the data we care about
        console.log('TzKT Storage Data:', {
            max_shares: data.max_shares,
            admin_address: data.admin_address,
            issued_shares: data.issued_shares,
            owners_map: entries.ownersMapEntries,
            unclaimed: entries.unclaimedSharesEntries,
            balances: entries.shareBalancesEntries
        });

        return entries;
    } catch (error) {
        console.error("Failed to load contract from TzKT API:", error);
        throw error;
    }
} 