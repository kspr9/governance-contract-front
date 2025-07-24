<script lang="ts">
    import { onMount } from 'svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { Tezos, wallet, connectWallet, disconnectWallet, getActiveAccount, getWalletBalance } from './config/beaconConfig';
    import tezosLogo from '../assets/Tezos.svg';
    import { Wallet } from 'lucide-svelte';
    import { ChevronDown } from 'lucide-svelte';

    interface Props {
        navbarMode?: boolean;
    }

    let { navbarMode = false }: Props = $props();

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
    <div class="flex items-center gap-3">
        <!-- Tezos Network Dropdown -->
        <div class="relative group">
            <button class="flex items-center gap-3 border border-white bg-(--accent) group-hover:bg-white text-white group-hover:text-(--primary) pl-1 pr-2 py-1 rounded-full transition-colors duration-200">
                <img src={tezosLogo} alt="Tezos" class="w-6 h-6" />            
                <span class="text-sm font-medium">Tezos</span>
                <ChevronDown class="w-4 h-4 text-white group-hover:text-(--primary) transition-colors transition-transform group-hover:rotate-180" />
            </button>
            <!-- Dropdown menu would go here -->
        </div>

        {#if beaconState.isConnected}
            <!-- Wallet Address Dropdown -->
            <div class="relative group">
                <button class="wallet-hover flex items-center gap-3 border-white hover:border-white bg-white group-hover:bg-(--accent) px-4 py-1 pt-1.5 pb-1.5 rounded-full transition-colors duration-200">
                    <Wallet size={22} strokeWidth={2} class="text-(--primary) group-hover:text-white transition-colors" />
                    <span class="text-sm text-(--primary) group-hover:text-white transition-colors" title={beaconState.address}>
                        {getShortAddress(beaconState.address)}
                    </span>
                    <ChevronDown class="w-4 h-4 text-(--primary) group-hover:text-white group-hover:rotate-180 transition-colors transition-transform" />
                </button>
                <!-- Dropdown menu -->
                <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div class="p-4">
                        <div class="text-sm text-gray-600 mb-2">Wallet Address</div>
                        <div class="font-mono text-sm text-gray-900 mb-3 break-all">{beaconState.address}</div>
                        <div class="text-sm text-gray-600 mb-2">Balance</div>
                        <div class="text-sm font-medium text-gray-900 mb-4">{beaconState.wbalance?.toFixed(3)} {tezSym}</div>
                        <button 
                            class="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 px-3 rounded-md hover:bg-red-50 transition-colors"
                            onclick={handleDisconnectWallet}
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Connect Wallet Button -->
            <button 
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                onclick={handleConnectWallet}
            >
                Connect Wallet
            </button>
        {/if}
    </div>
{:else}
    <div class="w-full h-full bg-(--card) rounded-(--radius) shadow p-4 border border-(--border)">
        {#if beaconState.isConnected}
            <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-sm truncate text-(--foreground)" title={beaconState.address}>
                    {getShortAddress(beaconState.address)}
                </span>
                <button class="btn-secondary" onclick={handleDisconnectWallet}>
                    Log out
                </button>
            </div>
            <div class="text-xs text-(--muted-foreground)">Balance: {beaconState.wbalance?.toFixed(3)} {tezSym}</div>
        {:else}
            <div class="flex items-center justify-between">
                <button class="btn-primary" onclick={handleConnectWallet} title="To interact with Share Register, connect your personal wallet.">
                    Connect Wallet
                </button>
            </div>
        {/if}
    </div>
{/if}

<style>
    .wallet-hover:hover {
        border: 1px solid var(--accent-foreground) !important;
        background-color: var(--primary-foreground) !important;
        color: var(--primary) !important;
    }
    .wallet-hover {
        border: 1px solid var(--primary-foreground) !important;
    }
</style>