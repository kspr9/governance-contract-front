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

    let balance: string = 'Loading...';
    let walletDataAvailable: boolean = false;
    let userAddress: string;

    let wbalance: string;

    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');
    
    /**
    
     TempleWallet.isAvailable()
     .then(async () => {
         const templeWallet = new TempleWallet('TokenShare');
         
         templeWallet
         .connect('ghostnet')
         .then(() => {
             //Tezos.setWalletProvider(templeWallet);
             return templeWallet.getPKH();
         })
         .then((pkh) => {
             console.log(`Your address: ${pkh}`);
             
            });
            
            const Tezos = templeWallet.toTezos();
            userAddress = await templeWallet.getPKH();
            
            
            
        })
        */
    //const Tezos = new TezosToolkit('https://ghostnet.smartpy.io');
    

    
    
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


    

</script>

<div id="taq">
    
    {#if walletDataAvailable}
        <h3>Wallet Address: {userAddress} </h3>
        <h3>Wallet Balance: {wbalance} {tezSym} </h3>
    {:else}
        <h3>Loading...</h3>
    {/if}
</div>

<style>
    
    #taq {
        display: grid;
        grid-template-columns: 250px 1fr;
        
    }
    @media screen and (max-height: 700px) {
        #taq {
            padding: 0px;
            height: 100%;
        }
    }
</style>