<script lang="ts">
    import { onMount } from 'svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { Tezos, wallet, connectWallet, disconnectWallet, getActiveAccount, getWalletBalance } from './config/beaconConfig';

    export let navbarMode: boolean = false;

    export const tezSym: string = 'ꜩ';

    // Helper to shorten address
    function getShortAddress(address: string | null | undefined): string {
        if (!address || address.length < 8) return address || '';
        return `${address.slice(0, 3)}...${address.slice(-4)}`;
    }

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

{#if navbarMode}
    {#if beaconState.isConnected}
        <div class="flex items-center gap-5">
            <span class="font-mono text-xs md:text-sm truncate text-white" title={beaconState.address}>
                {getShortAddress(beaconState.address)}
            </span>
            <span class="text-xs text-white/80">{beaconState.wbalance?.toFixed(3)} {tezSym}</span>
            <button class="text-xs font-semibold text-[color:var(--primary)] bg-white rounded px-3 py-1 shadow-sm hover:bg-blue-100 focus:outline-none transition-colors" onclick={handleDisconnectWallet}>
                Log out
            </button>
        </div>
    {:else}
        <div class="relative group">
            <button class="btn-primary text-xs px-3 py-1" onclick={handleConnectWallet}>
                Connect Wallet
            </button>
            <div class="absolute left-1/2 -translate-x-1/2 -top-9 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                Connect your Wallet to interact with Tokenized Shares Register
            </div>
        </div>
    {/if}
{:else}
    <div class="w-full h-full bg-[color:var(--card)] rounded-[var(--radius)] shadow p-4 border border-[color:var(--border)]">
        {#if beaconState.isConnected}
            <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-sm truncate text-[color:var(--foreground)]" title={beaconState.address}>
                    {getShortAddress(beaconState.address)}
                </span>
                <button class="btn-secondary" onclick={handleDisconnectWallet}>
                    Log out
                </button>
            </div>
            <div class="text-xs text-[color:var(--muted-foreground)]">Balance: {beaconState.wbalance?.toFixed(3)} {tezSym}</div>
        {:else}
            <div class="flex items-center justify-between">
                <button class="btn-primary" onclick={handleConnectWallet} title="To interact with Share Register, connect your personal wallet.">
                    Connect Wallet
                </button>
            </div>
        {/if}
    </div>
{/if}