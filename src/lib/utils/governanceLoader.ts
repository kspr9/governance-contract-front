import { governanceStorageData } from '../stores/governanceStorage.svelte';
import { get } from 'svelte/store';

export async function loadGovernanceContractTzkt(governanceAddress: string) {
  try {
    const response = await fetch(`https://api.mainnet.tzkt.io/v1/contracts/${governanceAddress}/storage`);
    const data = await response.json();
    governanceStorageData.admin = data.admin;
    governanceStorageData.deployedContracts = data.deployedContracts;
    return data;
  } catch (error) {
    console.error("Failed to load governance contract storage:", error);
    throw error;
  }
} 