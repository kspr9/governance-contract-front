<script lang="ts">
    import { onMount } from 'svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { Tezos, wallet, connectWallet, disconnectWallet, getActiveAccount, getWalletBalance } from './config/beaconConfig';

    export const tezSym: string = 'ꜩ';

    // On mount, check for existing connection
    onMount(async () => {
        try {
            const account = await getActiveAccount();
            if (account) {
                beaconState.address = account.address;
                beaconState.isConnected = true;
                beaconState.wbalance = await getWalletBalance(account.address);
            } else {
                beaconState.isConnected = false;
                beaconState.address = null;
                beaconState.wbalance = null;
            }
        } catch (error) {
            beaconState.error = error instanceof Error ? error.message : 'Failed to check wallet connection';
        }
    });

    // Connect wallet handler
    async function handleConnectWallet() {
        beaconState.error = null;
        try {
            const permissions = await connectWallet();
            beaconState.isConnected = true;
            beaconState.address = permissions.address;
            beaconState.wbalance = await getWalletBalance(permissions.address);
            walletStore.set(wallet);
        } catch (error) {
            beaconState.error = error instanceof Error ? error.message : 'Failed to connect wallet';
            beaconState.isConnected = false;
        }
    }

    // Disconnect wallet handler
    async function handleDisconnectWallet() {
        try {
            await disconnectWallet();
            beaconState.isConnected = false;
            beaconState.address = null;
            beaconState.wbalance = null;
            beaconState.error = null;
        } catch (error) {
            beaconState.error = error instanceof Error ? error.message : 'Failed to disconnect wallet';
        }
    }
</script>

<div class="w-full max-w-xl mx-auto bg-[color:var(--card)] rounded-lg shadow p-4 mb-4 border border-[color:var(--border)]">
  <h2 class="text-lg font-semibold mb-2 text-[color:var(--primary)]">Connected wallet</h2>
  {#if beaconState.error}
    <div class="p-2 mb-2 bg-red-100 text-red-700 rounded">
      {beaconState.error}
    </div>
  {/if}
  {#if beaconState.isConnected}
    <div class="flex items-center justify-between mb-2">
      <span class="font-mono text-sm truncate text-[color:var(--foreground)]">{beaconState.address}</span>
      <button class="px-3 py-1 rounded bg-[color:var(--muted)] text-[color:var(--primary)] hover:bg-[color:var(--card)] border border-[color:var(--border)] ml-2" onclick={handleDisconnectWallet}>Disconnect</button>
    </div>
    <div class="text-xs text-[color:var(--muted-foreground)]">Balance: {beaconState.wbalance?.toFixed(3)} {tezSym}</div>
  {:else}
    <button class="px-4 py-2 bg-[color:var(--primary)] text-[color:var(--background)] rounded hover:bg-[color:var(--accent)] w-full border border-[color:var(--border)]" onclick={handleConnectWallet}>Connect Wallet</button>
  {/if}
</div>