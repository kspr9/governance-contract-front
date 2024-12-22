<script lang="ts">
    import { onMount } from "svelte";
   
    import { TezosToolkit } from '@taquito/taquito';
    import { TempleWallet } from '@temple-wallet/dapp';



    const tezSym: string ='ꜩ'
    /**
     
    const testWallets: Wallets = {
        'Kaspar': {'address': 'tz1QSUqRdw5fx5E24q2LGcPmiekyP38L3GpXf', 'balance': 0},
        'kspr': {'address': 'tz1RuTC6e6FxWLTPPjAG3tesiBwwkK1bBkqR', 'balance': 0}
    }
    tz1QSURdw5fx5E24q2LGcPmiekyP38L3GpXf
    tz1QSUqRdw5fx5E24q2LGcPmiekyP38L3GpXf
    tz1QSURdw5fx5E24q2LGcPmiekyP38L3GpXf
    tz1QSURdw5fx5E24q2LGcPmiekyP38L3GpXf
    */
    
   
    /** Testing working with ticket and imp addresses */

    const wallet_kspr: string = "tz1RuTC6e6FxWLTPPjAG3tesiBwwkK1bBkqR"

    let ticketToken = {
        ticketer: 'TICKETER_ADDRESS', // Contract address that issued the ticket
        value: {
        // Ticket value details (e.g., content), match the ticket schema
        content_type: { prim: 'string' },
        content: { string: 'Ticket' }
        },
        amount: 1 // Number of tickets to send
    };

 
    let walletDataAvailable: boolean = false;
    let userAddress: string;
    let wbalance: string;

    let contractAddress: string = '';
    let contractInstance: any = null;
    let storageData: any = null;
    let contractScript: any = null;
    let contractEntrypoints: any = null;


    let amount = '';
    let destination = '';
    let share = '';


    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');

    
    
    onMount(async () => {
        const wallet: TempleWallet = new TempleWallet('TokenShare');

        try {
            const available = await TempleWallet.isAvailable();
            if (!available) {
                throw new Error('Temple Wallet not installed');
            }
        } catch (err) {
            console.log(err);
        }

        TempleWallet.isAvailable()
        .then(async () => {
            await wallet.connect('ghostnet');
            Tezos = wallet.toTezos();

            userAddress = await wallet.getPKH();
            console.log(`Your address: ${userAddress}`);

            try {
                const balance = await getWalletBalance(userAddress);
                const twoDecBalance = parseFloat(balance.toFixed(2));
                console.log(`Wallet balance: ${twoDecBalance} ${tezSym}`);
                wbalance = twoDecBalance.toString();
                walletDataAvailable = true;
            } catch (error) {
                console.error("Error getting wallet balance:", error);
                walletDataAvailable = false;
            }
        })
        .catch(error => {
            console.error("Error connecting to wallet:", error);
            walletDataAvailable = false; // Ensure to handle error states as well
        });
    });

    async function getWalletBalance(address: string): Promise<number> {
        console.log(`Getting wallet balance for ${address}`);
        try {
            // Directly await the promise and store the result
            const balance = await Tezos.tz.getBalance(address);
            const balanceNumber = balance.toNumber() / 1000000; // Convert from BigNumber to Number if necessary
            console.log(`Wallet balance: ${balanceNumber} ${tezSym}`);
            return balanceNumber;
        } catch (error) {
            console.log(JSON.stringify(error));
            console.error("Failed to fetch balance for address:", address, error);
            return 0; // Return 0 or handle the error appropriately
        }
     }

     async function loadContract() {
        if (!contractAddress) {
        console.error('No contract address provided');
        return;
        }
        contractInstance = await Tezos.wallet.at(contractAddress);
        // Get and display the contract's storage
        storageData = await contractInstance.storage();

        // Get and display the contract's script
        contractScript = contractInstance.script;

        // Get and display the contract's entrypoints
        contractEntrypoints = contractInstance.entrypoints;
    }

    async function transferShares() {
        if (!contractAddress) {
            console.error('No contract address provided');
            return;
        }
        const contractInstance = await Tezos.wallet.at(contractAddress);
        const operation = await contractInstance.methods.transfer_shares({
            amount: Number(amount),
            destination,
            share
        }).send();
        await operation.confirmation();
    }

</script>

<div id="taq">
    <h2 class="text-2xl font-bold text-primary">Wallet data</h2>
    {#if walletDataAvailable}
    <div class="card">
        <h3>Wallet Address: {userAddress} </h3>
        <h3>Wallet Balance: {wbalance} {tezSym} </h3>
    </div>

    <input bind:value={contractAddress} placeholder="Enter contract address" />
    <button on:click={loadContract}>Load Contract</button>
    {:else}
    <div>
        <h3>Loading...</h3>
    </div>
    {/if}
    {#if contractInstance}
        <div>
            <form on:submit|preventDefault={transferShares}>
                <label>
                Amount:
                <input type="number" bind:value={amount} />
                </label>
                <label>
                Destination:
                <input type="text" bind:value={destination} />
                </label>
                <label>
                Share:
                <input type="text" bind:value={share} />
                </label>
                <button type="submit">Transfer Shares</button>
            </form>
        </div>
        {#if storageData}
            <h2>Storage Data</h2>
            <pre>{JSON.stringify(storageData, null, 2)}</pre>
        {/if}

        {#if contractScript}
            <h2>Contract Script</h2>
            <pre>{JSON.stringify(contractScript, null, 2)}</pre>
        {/if}

        {#if contractEntrypoints}
            <h2>Contract Entrypoints</h2>
            <pre>{JSON.stringify(contractEntrypoints, null, 2)}</pre>
        {/if}
    {/if}
</div>

<style>
    
    #taq {
        display: flex;
        flex-direction: column;
        gap: 10px;
        
    }
    @media screen and (max-height: 700px) {
        #taq {
            padding: 0px;
            height: 100%;
        }
    }
</style>