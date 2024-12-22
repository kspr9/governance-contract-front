<script lang="ts">
    import { onMount } from "svelte";
   
    import { TezosToolkit } from '@taquito/taquito';
    import { TempleWallet } from '@temple-wallet/dapp';



    const tezSym: string ='ꜩ'

        // Props and state
    export let contractAddress: string = '';
    let userAddress: string;
    let wbalance: string;
    let walletDataAvailable: boolean = false;
    let contractInstance: any = null;
    let storageData: any = null;
    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');

    let ownersMapEntries: [string, number][] = [];
    let unclaimedSharesEntries: [string, any][] = [];
    let shareBalancesEntries: [string, any][] = [];
    
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
    /**
     * 
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
    
    */
 
    /*
        let walletDataAvailable: boolean = false;
        let userAddress: string;
        let wbalance: string;

        let contractAddress: string = '';
        let contractInstance: any = null;
        let storageData: any = null;Contract data
    */


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

    onMount(async () => {
        const wallet = new TempleWallet('TokenShare');
        try {
            const available = await TempleWallet.isAvailable();
            if (!available) throw new Error('Temple Wallet not installed');
            
            await wallet.connect('ghostnet');
            Tezos = wallet.toTezos();
            userAddress = await wallet.getPKH();
            
            const balance = await getWalletBalance(userAddress);
            wbalance = balance.toFixed(2);
            walletDataAvailable = true;
        } catch (err) {
            console.error(err);
            walletDataAvailable = false;
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

    async function loadContract() {
        try {
            contractInstance = await Tezos.wallet.at(contractAddress);
            storageData = await contractInstance.storage();
            
            // Process owners map
            ownersMapEntries = [];
            storageData.owners_map.forEach((value, key) => {
                ownersMapEntries.push([key, value]);
            });

            // Process unclaimed shares
            unclaimedSharesEntries = [];
            storageData.issued_unclaimed_shares2.forEach((value, key) => {
                unclaimedSharesEntries.push([key, value]);
            });

            // Process share balances
            shareBalancesEntries = [];
            storageData.share_balances.forEach((value, key) => {
                shareBalancesEntries.push([key, value]);
            });

        } catch (error) {
            console.error("Failed to load contract:", error);
        }
    }

    // Admin Functions
    async function addShareOwner() {
        try {
            const operation = await contractInstance.methods.add_share_owner(
                adminForms.addShareOwner.amount,
                adminForms.addShareOwner.ownerAddress
            ).send();
            await operation.confirmation();
            await loadContract(); // Refresh data
        } catch (error) {
            console.error("Failed to add share owner:", error);
        }
    }

    async function changeMaxShares() {
        try {
            const operation = await contractInstance.methods.change_max_shares(
                adminForms.changeMaxShares.newMax
            ).send();
            await operation.confirmation();
            await loadContract();
        } catch (error) {
            console.error("Failed to change max shares:", error);
        }
    }

    async function issueShares() {
        try {
            const operation = await contractInstance.methods.issue_shares_unclaimed2(
                adminForms.issueShares.amount
            ).send();
            await operation.confirmation();
            await loadContract();
        } catch (error) {
            console.error("Failed to issue shares:", error);
        }
    }

    // User Functions
    async function transferShares() {
        try {
            const operation = await contractInstance.methods.transfer_shares(
                userForms.transferShares.amount,
                userForms.transferShares.destination,
                userForms.transferShares.share
            ).send();
            await operation.confirmation();
            await loadContract();
        } catch (error) {
            console.error("Failed to transfer shares:", error);
        }
    }

    async function claimShares() {
        try {
            const operation = await contractInstance.methods.claim_shares(
                userForms.claimShares.address
            ).send();
            await operation.confirmation();
            await loadContract();
        } catch (error) {
            console.error("Failed to claim shares:", error);
        }
    }

    $: isAdmin = storageData?.admin_address === userAddress;
</script>

<div class="container mx-auto p-4">
    <!-- Wallet Info -->
    <div class="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Wallet Information</h2>
        {#if walletDataAvailable}
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <span class="font-semibold">Address:</span> 
                    <span class="font-mono">{userAddress}</span>
                </div>
                <div>
                    <span class="font-semibold">Balance:</span> 
                    <span>{wbalance} {tezSym}</span>
                </div>
            </div>
        {:else}
            <p>Loading wallet data...</p>
        {/if}
    </div>

    <!-- Contract Loading -->
    <div class="mb-8">
        <div class="flex gap-4">
            <input 
                class="flex-1 p-2 border rounded" 
                bind:value={contractAddress} 
                placeholder="Enter contract address" 
            />
            <button 
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                on:click={loadContract}
            >
                Load Contract
            </button>
        </div>
    </div>

    {#if contractInstance && storageData}
        <!-- Contract Storage Display -->
        <div class="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Contract Storage</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <span class="font-semibold">Registry Number:</span> 
                    <span>{storageData.registry_number?.Some || 'Not set'}</span>
                </div>
                <div>
                    <span class="font-semibold">Max Shares:</span> 
                    <span>{storageData.max_shares?.Some || 'Not set'}</span>
                </div>
                <div>
                    <span class="font-semibold">Issued Shares:</span> 
                    <span>{storageData.issued_shares}</span>
                </div>
                <div>
                    <span class="font-semibold">Allocated Shares:</span> 
                    <span>{storageData.allocated_shares}</span>
                </div>
                <div>
                    <span class="font-semibold">All Shares Issued:</span> 
                    <span>{storageData.all_shares_issued ? 'Yes' : 'No'}</span>
                </div>
            </div>

            <!-- Share Owners (Entitled to Claim) -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Share Owners (Entitled to Claim)</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Address</th>
                            <th class="text-right p-2 bg-gray-200">Entitled Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if ownersMapEntries.length > 0}
                            {#each ownersMapEntries as [address, shares]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">{address}</td>
                                    <td class="text-right p-2">{shares}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="2" class="text-center p-2">No share owners found</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Issued Unclaimed Shares -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Issued Unclaimed Shares</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Company Address</th>
                            <th class="text-right p-2 bg-gray-200">Registry Number</th>
                            <th class="text-right p-2 bg-gray-200">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if unclaimedSharesEntries.length > 0}
                            {#each unclaimedSharesEntries as [id, ticket]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">{ticket.ticketer}</td>
                                    <td class="text-right p-2">{ticket.value}</td>
                                    <td class="text-right p-2">{ticket.amount}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="3" class="text-center p-2">No unclaimed shares found</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Share Balances (Owned Tickets) -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Share Balances (Owned Company Shares)</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Company Address</th>
                            <th class="text-right p-2 bg-gray-200">Registry Number</th>
                            <th class="text-right p-2 bg-gray-200">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if shareBalancesEntries.length > 0}
                            {#each shareBalancesEntries as [address, ticket]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">{ticket.ticketer}</td>
                                    <td class="text-right p-2">{ticket.value}</td>
                                    <td class="text-right p-2">{ticket.amount}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="3" class="text-center p-2">No share balances found</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Admin Functions -->
        {#if isAdmin}
            <div class="mb-8 p-4 bg-blue-50 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">Admin Functions</h2>
                
                <!-- Add Share Owner Form -->
                <form on:submit|preventDefault={addShareOwner} class="mb-4">
                    <h3 class="text-xl font-semibold mb-2">Add Share Owner</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <input 
                            type="number" 
                            bind:value={adminForms.addShareOwner.amount}
                            placeholder="Amount"
                            class="p-2 border rounded"
                        />
                        <input 
                            type="text" 
                            bind:value={adminForms.addShareOwner.ownerAddress}
                            placeholder="Owner Address"
                            class="p-2 border rounded"
                        />
                    </div>
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Owner
                    </button>
                </form>

                <!-- Change Max Shares Form -->
                <form on:submit|preventDefault={changeMaxShares} class="mb-4">
                    <h3 class="text-xl font-semibold mb-2">Change Max Shares</h3>
                    <input 
                        type="number" 
                        bind:value={adminForms.changeMaxShares.newMax}
                        placeholder="New Maximum Shares"
                        class="p-2 border rounded"
                    />
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Update Max Shares
                    </button>
                </form>

                <!-- Issue Shares Form -->
                <form on:submit|preventDefault={issueShares}>
                    <h3 class="text-xl font-semibold mb-2">Issue Shares</h3>
                    <input 
                        type="number" 
                        bind:value={adminForms.issueShares.amount}
                        placeholder="Amount to Issue"
                        class="p-2 border rounded"
                    />
                    <button 
                        type="submit"
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Issue Shares
                    </button>
                </form>
            </div>
        {/if}

        <!-- User Functions -->
        <div class="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">User Functions</h2>
            
            <!-- Transfer Shares Form -->
            <form on:submit|preventDefault={transferShares} class="mb-4">
                <h3 class="text-xl font-semibold mb-2">Transfer Shares</h3>
                <div class="grid grid-cols-3 gap-4">
                    <input 
                        type="number" 
                        bind:value={userForms.transferShares.amount}
                        placeholder="Amount"
                        class="p-2 border rounded"
                    />
                    <input 
                        type="text" 
                        bind:value={userForms.transferShares.destination}
                        placeholder="Destination Address"
                        class="p-2 border rounded"
                    />
                    <input 
                        type="text" 
                        bind:value={userForms.transferShares.share}
                        placeholder="Share Address"
                        class="p-2 border rounded"
                    />
                </div>
                <button 
                    type="submit"
                    class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Transfer Shares
                </button>
            </form>

            <!-- Claim Shares Form -->
            <form on:submit|preventDefault={claimShares}>
                <h3 class="text-xl font-semibold mb-2">Claim Shares</h3>
                <input 
                    type="text" 
                    bind:value={userForms.claimShares.address}
                    placeholder="Address"
                    class="p-2 border rounded"
                />
                <button 
                    type="submit"
                    class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Claim Shares
                </button>
            </form>
        </div>
    {/if}
</div>

<style>
    
</style>