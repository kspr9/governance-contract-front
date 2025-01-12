<script lang="ts">
    import { onMount } from "svelte";
    import { TezosToolkit } from '@taquito/taquito';
    import { contractState } from './stores/contract';
    import { tzktStorageData } from './stores/tzktStorage.svelte';

    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');

    let contractInstance: any;
    let adminAddress: string | null = tzktStorageData.admin_address;

    // Form states
    let adminForms = {
        addShareOwner: { amount: '', ownerAddress: '' },
        changeMaxShares: { newMax: '' },
        issueShares: { amount: '' }
    };
    
    let userForms = {
        transferShares: { amount: '', destination: '', share: '' },
        claimShares: { address: '' }
    };

    async function ConnectContract() {
        try {
            if (!$contractState.contractAddress) {
                throw new Error("Contract address not set");
            }
            contractInstance = await Tezos.wallet.at($contractState.contractAddress);
        } catch (error) {
            console.error("Failed to load contract:", error);
        }
    }


</script>

<div>
    {#if contractInstance }
        <div>
            <h2 class="text-2xl font-bold mb-4">Hi</h2>
            {contractInstance}
        </div>
    {/if}
</div>