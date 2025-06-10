<script lang="ts">
    import { onMount } from 'svelte';
    import { TezosToolkit } from '@taquito/taquito';
    import { TempleWallet } from '@temple-wallet/dapp';

    export const tezSym: string ='ꜩ';

    interface WalletData {
        wallet: TempleWallet | null;
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
    const wallet = new TempleWallet('TokenShare');

    onMount(async () => {
      try {
        const available = await TempleWallet.isAvailable();
        if (!available) throw new Error('Temple Wallet not installed');
        
        await wallet.connect('ghostnet');
        let userAddress = await wallet.getPKH();
        let balance = await getWalletBalance(userAddress);
      
        
        walletState.wallet = wallet;
        walletState.Tezos = wallet.toTezos();
        walletState.userAddress = userAddress;
        walletState.wbalance = balance.toFixed(2);;
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
     <div class="card mb-8">
        <h2 class="section-header mb-4">Wallet Information</h2>
        {#if walletState.walletDataAvailable}
            <div class="grid grid-cols-5 gap-4">
                <div class="col-span-4">
                    <span class="font-semibold text-[color:var(--primary)]">Address:</span> 
                    <span class="font-mono text-[color:var(--foreground)]">{walletState.userAddress}</span>
                </div>
                <div class="flex justify-end">
                    <span class="font-semibold text-[color:var(--primary)]">Balance:</span> 
                    <span class="text-[color:var(--foreground)]">{walletState.wbalance} {tezSym}</span>
                </div>
            </div>
        {:else}
            <p class="text-[color:var(--muted-foreground)]">Loading wallet data...</p>
        {/if}
    </div>
</div>