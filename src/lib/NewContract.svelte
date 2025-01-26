<script lang="ts">
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import { beaconState, walletStore } from './stores/beaconStore.svelte';
    import { get } from "svelte/store";
    import contractCode from '../assets/walletContract.json';
    import initialStorage from '../assets/walletStorage.json';
    import { getTezosToolkit, getBeaconWallet } from "./config/beaconConfig";
    import { MichelsonMap } from '@taquito/michelson-encoder';

    const wallet = getBeaconWallet();
    const Tezos = getTezosToolkit();
    
    const storage = {
        admin_address : "tz1PfKWpMH8bJ3p5WRetGTZZM7idGP7kKW9M",
        all_shares_issued: false,
        allocated_shares: 0,
        issued_shares: 0,
        issued_unclaimed_shares2: new MichelsonMap(),
        max_shares: null,
        owners_map: new MichelsonMap(),
        registry_number: null,
        share_balances: new MichelsonMap()
    };

    async function originateContract() {
        Tezos.setProvider({wallet});
        // Originate a new contract
        const operation = await Tezos.wallet.originate({
            code: contractCode,
            storage: storage,
        }).send()
        .then((originationOp) => {
            console.log(`Waiting for confirmation of origination...`);
            return originationOp.contract();
        })
        .then((contract) => {
            console.log(`Origination completed for ${contract.address}.`);
        })
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
        
    }
  

    // Debug effect to help track state changes
    $effect(() => {
        console.log('State Debug:', {
            beaconAddress: beaconState.address,
            adminAddress: tzktStorageData.admin_address,
        });
    });
</script>

<div>
    <button onclick={originateContract}>Originate Contract</button>
</div>