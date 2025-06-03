import { writable } from 'svelte/store';

export interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

export interface TzktStorageData {
    max_shares: string | null;
    eligible_claimants_map: Record<string, string> | null;
    admin_address: string | null;
    issued_shares: string | null;
    held_external_shares: Record<string, TzktTicket> | null;
    registry_number: string | null;
    total_allocated_shares: string | null;
    share_ledger: Record<string, string> | null;
    unclaimed_share_pool: Record<string, TzktTicket> | null;
}

export const tzktStorageData = $state<TzktStorageData>({
    max_shares: null,
    eligible_claimants_map: null,
    admin_address: null,
    issued_shares: null,
    held_external_shares: null,
    registry_number: null,
    total_allocated_shares: null,
    share_ledger: null,
    unclaimed_share_pool: null
}); 