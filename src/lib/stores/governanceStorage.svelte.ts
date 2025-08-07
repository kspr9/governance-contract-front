import { writable } from 'svelte/store';

export interface GovernanceStorageData {
  admin: string | null;
  deployedContracts: Record<string, string> | null;
}

export const governanceStorageData = $state<GovernanceStorageData>({
  admin: null,
  deployedContracts: null
}); 