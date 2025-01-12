import { writable } from 'svelte/store';

export interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

export interface TzktStorageData {
    max_shares: string | null;
    owners_map: Record<string, string> | null;
    admin_address: string | null;
    issued_shares: string | null;
    share_balances: Record<string, TzktTicket> | null;
    registry_number: string | null;
    allocated_shares: string | null;
    all_shares_issued: boolean;
    issued_unclaimed_shares2: Record<string, TzktTicket> | null;
}

export const tzktStorageData = $state<TzktStorageData>({
    max_shares: null,
    owners_map: null,
    admin_address: null,
    issued_shares: null,
    share_balances: null,
    registry_number: null,
    allocated_shares: null,
    all_shares_issued: false,
    issued_unclaimed_shares2: null
}); 