import { contractState } from '../stores/contractStore.svelte';
import { tzktStorageData } from '../stores/tzktStorage.svelte';
import { get } from 'svelte/store';

interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

interface TzktStorageData {
    owners_map: Record<string, string>;
    issued_unclaimed_shares2: Record<string, TzktTicket>;
    share_balances: Record<string, TzktTicket>;
    active_share_ledger: Record<string, string>;
    max_shares: string;
    admin_address: string;
    issued_shares: string;
    allocated_shares: string;
    all_shares_issued: boolean;
    registry_number?: string;
}

// Updated ContractEntries includes active ledger entries
interface ContractEntries {
    ownersMapEntries: [string, string][];
    unclaimedSharesEntries: [string, TzktTicket][];
    shareBalancesEntries: [string, TzktTicket][];
    activeLedgerEntries: [string, string][];
}

export async function loadContractTzkt(): Promise<ContractEntries> {
    try {
        const response = await fetch(`https://api.ghostnet.tzkt.io/v1/contracts/${get(contractState).contractAddress}/storage`);
        const data = await response.json() as TzktStorageData;
        
        // Update the global storage with the new data
        Object.assign(tzktStorageData, data);

        const entries: ContractEntries = {
            ownersMapEntries: Object.entries(data.owners_map ?? {}),
            unclaimedSharesEntries: Object.entries(data.issued_unclaimed_shares2 ?? {}),
            shareBalancesEntries: Object.entries(data.share_balances ?? {}),
            activeLedgerEntries: Object.entries(data.active_share_ledger ?? {})
        };

        console.log('TzKT Storage Data:', {
            max_shares: data.max_shares,
            admin_address: data.admin_address,
            issued_shares: data.issued_shares,
            allocated_shares: data.allocated_shares,
            all_shares_issued: data.all_shares_issued,
            owners_map: entries.ownersMapEntries,
            unclaimed: entries.unclaimedSharesEntries,
            balances: entries.shareBalancesEntries,
            activeLedger: entries.activeLedgerEntries
        });

        return entries;
    } catch (error) {
        console.error("Failed to load contract from TzKT API:", error);
        throw error;
    }
} 