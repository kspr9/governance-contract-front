<script lang="ts">
    import { TezosToolkit } from '@taquito/taquito';
    import { BeaconWallet } from '@taquito/beacon-wallet';
    import { DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-dapp';
    import { onMount } from 'svelte';

    export const walletState = $state({
        address: null as string | null,
        isConnected: false
    });

    const options: DAppClientOptions = {
        name: 'Tokensharebeacon',
        iconUrl: 'https://taquito.io/img/favicon.svg',
        network: { type: NetworkType.GHOSTNET },
        enableMetrics: true,
    };

    let userAddress: string;

    async function walletInit() {
        const Tezos = new TezosToolkit('https://ghostnet.smartpy.io');
        const wallet: DAppClient = new DAppClient(options);
        try {
            console.log("Requesting permissions...");
            const permissions = await wallet.requestPermissions();
            console.log("Got permissions:", permissions.address);
        } catch (error) {
            console.error("Got error:", error);
        }
        //Tezos.setWalletProvider(wallet);
        

    };
    

    onMount(async () => {
        await walletInit();
        
    });
</script>