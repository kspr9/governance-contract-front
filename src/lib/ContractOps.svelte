<script lang="ts">
    import { onMount } from "svelte";
    import { TezosToolkit } from '@taquito/taquito';
    import { contractState } from './stores/contract';

    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');

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




</script>