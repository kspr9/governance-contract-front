<script lang="ts">
    import { DAppClient, type DAppClientOptions, NetworkType, BeaconEvent } from '@airgap/beacon-dapp';
    import { onMount, onDestroy } from 'svelte';
    import { TezosToolkit } from '@taquito/taquito';

    export const tezSym: string ='ꜩ';

    export const walletState = $state({
        address: null as string | null,
        wbalance: null as number | null,
        isConnected: false,
        network: NetworkType.GHOSTNET,
        error: null as string | null
    });

    const options: DAppClientOptions = {
        name: 'Tokensharebeacon',
        iconUrl: 'https://taquito.io/img/favicon.svg',
        network: { type: walletState.network as NetworkType },
        enableMetrics: true,
    };

    let wallet = new DAppClient(options);
    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');

    // Set up the event subscription immediately after creating the DAppClient
    wallet.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
        console.log(
            `${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `,
            account,
            account?.address,
        );
        if (!account) {
            return;
        }

        try {
            await wallet.requestSignPayload({
                payload: "05010000004254657a6f73205369676e6564204d6573736167653a207465737455726c20323032332d30322d30385431303a33363a31382e3435345a2048656c6c6f20576f726c64",
            });
        } catch (err: any) {
            // The request was rejected
            disconnectWallet();
        }
    });

    async function checkExistingConnection() {
        try {
            const activeAccount = await wallet.getActiveAccount();
            if (activeAccount) {
                walletState.address = activeAccount.address;
                walletState.isConnected = true;
                console.log("Found existing connection:", activeAccount.address);
                const balance = await Tezos.tz.getBalance(activeAccount.address);
                walletState.wbalance = balance.toNumber() / 1000000;
                return true;
            } 
        } catch (error) {
            console.error("Error checking existing connection:", error);
            walletState.error = error instanceof Error ? error.message : "Failed to check wallet connection";
        }
        return false;
    }

    async function connectWallet() {
        try {
            walletState.error = null;
            console.log("Requesting permissions...");
            
            if (walletState.isConnected) {
                return;
            }
            
            const permissions = await wallet.requestPermissions(options);
            const balance = await Tezos.tz.getBalance(permissions.address);
            
            walletState.wbalance = balance.toNumber() / 1000000;
            walletState.address = permissions.address;
            walletState.isConnected = true;

            console.log("Connected to wallet:", permissions.address);
        } catch (error) {
            console.error("Connection error:", error);
            walletState.error = error instanceof Error ? error.message : "Failed to connect wallet";
            walletState.isConnected = false;
        }
    }

    async function disconnectWallet() {
        try {
            wallet.disconnect()
            .then(() => {
                console.log("Wallet disconnected");
                walletState.address = null;
                walletState.isConnected = false;
                walletState.error = null;
            })
            .catch((err) => console.error(err.message));;
            
        } catch (error) {
            console.error("Disconnection error:", error);
            walletState.error = error instanceof Error ? error.message : "Failed to disconnect wallet";
        }
    }

    onMount(async () => {
        // Check for existing connection first, don't prompt if already connected
        await checkExistingConnection();
    });

    onDestroy(() => {
        if (walletState.isConnected) {
            disconnectWallet().catch(console.error);
        }
    });
</script>

<div class="container mx-auto p-4 bg-gray-100 rounded-md">
    <h2 class="text-2xl font-bold mb-4">Wallet Information</h2>
    {#if walletState.error}
        <div class="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {walletState.error}
        </div>
    {/if}

    {#if walletState.isConnected}
        <div class="grid grid-cols-5 gap-4">
            <div class="col-span-4">
                <span class="font-semibold">Address:</span>
                <span class="font-mono">{walletState.address}</span> 
            </div>
            <div class="flex justify-end">
                <span class="font-semibold">Balance:</span>
                <span>{walletState.wbalance} {tezSym}</span>
            </div>
            
            <button 
                class="px-4 py-2 bg-red-500 text-white rounded 
                hover:bg-red-600"
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