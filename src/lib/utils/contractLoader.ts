import { contractState } from '../stores/contractStore.svelte';
import { tzktStorageData } from '../stores/tzktStorage.svelte';
import { get } from 'svelte/store';

interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

interface TzktStorageData {
    eligible_claimants_map: Record<string, string>;
    unclaimed_share_pool: Record<string, TzktTicket>;
    held_external_shares: Record<string, TzktTicket>;
    share_ledger: Record<string, string>;
    max_shares: string;
    admin_address: string;
    issued_shares: string;
    total_allocated_shares: string;
    registry_number?: string;
}

interface ContractEntries {
    eligibleClaimantsEntries: [string, string][];
    unclaimedSharePoolEntries: [string, TzktTicket][];
    heldExternalSharesEntries: [string, TzktTicket][];
    shareLedgerEntries: [string, string][];
}

export async function loadContractTzkt(): Promise<ContractEntries> {
    try {
        const response = await fetch(`https://api.mainnet.tzkt.io/v1/contracts/${get(contractState).contractAddress}/storage`);
        const data = await response.json() as TzktStorageData;
        
        // Update the global storage with the new data
        Object.assign(tzktStorageData, data);

        const entries: ContractEntries = {
            eligibleClaimantsEntries: Object.entries(data.eligible_claimants_map ?? {}),
            unclaimedSharePoolEntries: Object.entries(data.unclaimed_share_pool ?? {}),
            heldExternalSharesEntries: Object.entries(data.held_external_shares ?? {}),
            shareLedgerEntries: Object.entries(data.share_ledger ?? {})
        };

        console.log('TzKT Storage Data:', {
            max_shares: data.max_shares,
            admin_address: data.admin_address,
            issued_shares: data.issued_shares,
            total_allocated_shares: data.total_allocated_shares,
            eligible_claimants_map: entries.eligibleClaimantsEntries,
            unclaimed_share_pool: entries.unclaimedSharePoolEntries,
            held_external_shares: entries.heldExternalSharesEntries,
            share_ledger: entries.shareLedgerEntries
        });

        return entries;
    } catch (error) {
        console.error("Failed to load contract from TzKT API:", error);
        throw error;
    }
} 