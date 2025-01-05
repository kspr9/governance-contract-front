<script lang="ts">
    import { TezosToolkit } from '@taquito/taquito';
    import { BeaconWallet } from '@taquito/beacon-wallet';
    import { BeaconEvent } from '@airgap/beacon-dapp';
    import { onMount } from 'svelte';

    export const walletState = $state({
        address: null as string | null,
        isConnected: false
    });

    let userAddress: string;

    async function walletInit() {
        const Tezos = new TezosToolkit('https://ghostnet.smartpy.io');
        const wallet: BeaconWallet = new BeaconWallet({
            name: 'Tokensharebeacon'
        });
        Tezos.setWalletProvider(wallet);
        wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            // An active account has been set, update the dApp UI
            console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
        });
        try {
            console.log("Requesting permissions...");
            const permissions = await wallet.client.requestPermissions();
            console.log("Got permissions:", permissions.address);
        } catch (error) {
            console.error("Got error:", error);
        }

    };
    

    onMount(async () => {
        await walletInit();
        
    });
</script>