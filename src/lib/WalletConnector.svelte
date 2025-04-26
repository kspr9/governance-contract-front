<script lang="ts">
    import { onMount } from 'svelte';
    import { TezosToolkit } from '@taquito/taquito';
    import { BeaconWallet } from '@taquito/beacon-wallet';
    import { NetworkType } from '@airgap/beacon-sdk';

    export const tezSym: string ='ꜩ';

    interface WalletData {
        wallet: BeaconWallet | null;
        Tezos: TezosToolkit | null;
        userAddress: string | null;
        wbalance: string | null;
        walletDataAvailable: boolean;
    }

    export const walletState = $state<WalletData>({
        wallet: null,
        Tezos: null,
        userAddress: null,
        wbalance: null,
        walletDataAvailable: false
    });
    
    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');
    const wallet = new BeaconWallet({ 
        name: "TokenShare Beacon Wallet", 
        preferredNetwork: NetworkType.GHOSTNET 
    });

    onMount(async () => {
      try {
        const activeAccount = await wallet.client.getActiveAccount();
        if (!activeAccount) {
            const permissions = await wallet.client.requestPermissions({
                network: {
                    type: NetworkType.GHOSTNET,
                    rpcUrl: "https://ghostnet.smartpy.io"
                }
            });
            walletState.userAddress = permissions.address;
        } else {
            walletState.userAddress = activeAccount.address;
        }
        
        let balance = await getWalletBalance(walletState.userAddress);
        
        Tezos.setWalletProvider(wallet);
        walletState.wallet = wallet;
        walletState.Tezos = Tezos;
        walletState.wbalance = balance.toFixed(2);
        walletState.walletDataAvailable = true;

      } catch (err) {
        console.error(err);
        walletState.walletDataAvailable = false;
      }
    });

    async function getWalletBalance(address: string): Promise<number> {
        try {
            const balance = await Tezos.tz.getBalance(address);
            return balance.toNumber() / 1000000;
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            return 0;
        }
    }


</script>

<div>
     <!-- Wallet Info -->
     <div class="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Wallet Information</h2>
        {#if walletState.walletDataAvailable}
            <div class="grid grid-cols-5 gap-4">
                <div class="col-span-4">
                    <span class="font-semibold">Address:</span> 
                    <span class="font-mono">{walletState.userAddress}</span>
                </div>
                <div class="flex justify-end">
                    <span class="font-semibold">Balance:</span> 
                    <span>{walletState.wbalance} {tezSym}</span>
                </div>
            </div>
        {:else}
            <p>Loading wallet data...</p>
        {/if}
    </div>
</div>