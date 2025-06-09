import { get } from 'svelte/store';
import { contractState, contractInstance } from '../stores/contractStore.svelte';
import { beaconState } from '../stores/beaconStore.svelte';
import { Tezos, resetProvider } from '../config/beaconConfig';

interface TransferHeldSharesArgs {
  amount: string | number;
  destination: string;
  share: string;
}

/**
 * Transfers held shares from the current contract to a destination address.
 * Ensures wallet and contract are connected, then calls the contract entrypoint.
 */
export async function transferHeldShares({ amount, destination, share }: TransferHeldSharesArgs): Promise<void> {
  if (!beaconState.isConnected) {
    throw new Error('Wallet not connected');
  }
  const state = get(contractState);
  if (!state.contractAddress) {
    throw new Error('Contract address not set');
  }
  await resetProvider();
  let contract = get(contractInstance);
  if (!contract) {
    contract = await Tezos.wallet.at(state.contractAddress!);
    contractInstance.set(contract);
  }
  const op = await contract.methodsObject.transfer_held_shares({
    amount,
    destination,
    share
  }).send();
  await op.confirmation(2);
} 