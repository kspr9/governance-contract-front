<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { BeaconEvent } from '@airgap/beacon-sdk';
    import { beaconState, beaconClient, connectWallet, disconnectWallet, checkExistingConnection } from './stores/beaconStore.svelte';

    export const tezSym: string = 'ꜩ';

    // Set up the event subscription immediately
    beaconClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
        console.log(
            `${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `,
            account,
            account?.address,
        );
        if (!account) {
            return;
        }

        try {
            await beaconClient.requestSignPayload({
                payload: "05010000004254657a6f73205369676e6564204d6573736167653a207465737455726c20323032332d30322d30385431303a33363a31382e3435345a2048656c6c6f20576f726c64",
            });
        } catch (err: any) {
            // The request was rejected
            disconnectWallet();
        }
    });

    onMount(async () => {
        // Check for existing connection first, don't prompt if already connected
        await checkExistingConnection();
    });

    onDestroy(() => {
        if (beaconState.isConnected) {
            disconnectWallet().catch(console.error);
        }
    });
</script>

<div class="container mx-auto p-4 bg-gray-100 rounded-md">
    <h2 class="text-2xl font-bold mb-4">Wallet Information</h2>
    {#if beaconState.error}
        <div class="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {beaconState.error}
        </div>
    {/if}

    {#if beaconState.isConnected}
        <div class="grid grid-cols-5 gap-4">
            <div class="col-span-4">
                <span class="font-semibold">Address:</span>
                <span class="font-mono">{beaconState.address}</span> 
            </div>
            <div class="flex justify-end">
                <span class="font-semibold">Balance:</span>
                <span>{beaconState.wbalance} {tezSym}</span>
            </div>
            
            <button 
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onclick={disconnectWallet}
            >
                Disconnect
            </button>
        </div>
    {:else}
        <button 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onclick={connectWallet}
        >
            Connect Wallet
        </button>
    {/if}
</div>