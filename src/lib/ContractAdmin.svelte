<script lang="ts">
    import { onMount } from "svelte";
   
    import { TezosToolkit } from '@taquito/taquito';
    import { TempleWallet } from '@temple-wallet/dapp';
    import { MichelsonMap } from '@taquito/taquito';

    import contractCode2Originate from '../assets/walletContract.json';

    interface TzktTicket {
        data: string;
        amount: string;
        address: string;
    }

    interface TzktStorageData {
        max_shares: string;
        owners_map: Record<string, string>;
        admin_address: string;
        issued_shares: string;
        share_balances: Record<string, TzktTicket>;
        registry_number: string;
        allocated_shares: string;
        all_shares_issued: boolean;
        issued_unclaimed_shares2: Record<string, TzktTicket>;
    }

    const tezSym: string ='ꜩ';

    // Props and state
    export let contractAddress: string = '';
    let userAddress: string;
    let wbalance: string;
    let walletDataAvailable: boolean = false;
    let contractInstance: any = null;
    let storageData: any = null;
    let tzktStorageData: TzktStorageData | null = null;

    let Tezos: TezosToolkit = new TezosToolkit('https://ghostnet.smartpy.io');
    

    let tzktOwnersMapEntries: [string, string][] = [];
    let tzktUnclaimedSharesEntries: [string, any][] = [];
    let tzktShareBalancesEntries: [string, any][] = [];

    let contractScript: any = null;
    let contractCode: any = null;
    let contractStorageStructure: any = null;


    onMount(async () => {
        try {
            
        } catch (err) {
            console.error(err);

        }
    });


    async function loadContract() {
        try {
            contractInstance = await Tezos.wallet.at(contractAddress);
            storageData = await contractInstance.storage();
            //console.log(storageData.issued_unclaimed_shares2);
            for (const [address, ticket] of storageData.share_balances.entries()) {
                console.log(`Address: ${address}, Shares owned: ${ticket.amount}`);
            }

            for (const [key, ticket] of storageData.issued_unclaimed_shares2.entries()) {
                console.log('Issued unclaimed shares')
                console.log(`Key: ${key},  Ticketer: ${ticket.ticketer}, Value: ${ticket.value}, Amount: ${ticket.amount}`)
            }

            contractCode = contractInstance.script.code;
            contractStorageStructure = contractInstance.script.storage;
            console.log('contractStorageStructure')
            console.log(contractStorageStructure)
        } catch (error) {
            console.error("Failed to load contract:", error);
        }
    }

    async function loadContractTzkt() {
        try {
            const response = await fetch(`https://api.ghostnet.tzkt.io/v1/contracts/${contractAddress}/storage`);
            tzktStorageData = await response.json();
            
            // Process owners map
            tzktOwnersMapEntries = Object.entries(tzktStorageData?.owners_map ?? {});

            // Process unclaimed shares
            tzktUnclaimedSharesEntries = Object.entries(tzktStorageData?.issued_unclaimed_shares2 ?? {});

            // Process share balances
            tzktShareBalancesEntries = Object.entries(tzktStorageData?.share_balances ?? {});

            console.log('TzKT Storage Data:', tzktStorageData);
            console.log('Processed Entries:', {
                owners: tzktOwnersMapEntries,
                unclaimed: tzktUnclaimedSharesEntries,
                balances: tzktShareBalancesEntries
            });
        } catch (error) {
            console.error("Failed to load contract from TzKT API:", error);
        }
    }

    function extractStorageDataIntoVariables() {
        storageData
    }

</script>

<div class="container mx-auto p-4">

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
                Load Contract (Taquito)
            </button>
            <button 
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                on:click={loadContractTzkt}
            >
                Load Contract (TzKT)
            </button>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <!-- Taquito Contract Storage Display -->
        <div>
            {#if contractInstance && storageData}
            <div class="mb-8 p-4 bg-gray-100 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">Contract Storage (Taquito)</h2>
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
                    <div>
                        <span class="font-semibold">Contract admin:</span> 
                        <span>{storageData.admin_address}</span>
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
                            {#if storageData?.owners_map && storageData.owners_map.size > 0}
                                {#each storageData.owners_map.entries() as [address, shares]}
                                    <tr class="border-t">
                                        <td class="font-mono p-2">{address}</td>
                                        <td class="text-right p-2">{shares}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr class="border-t">
                                    <td class="text-center p-2 text-gray-500" colspan="2">No share owners registered</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>

                <!-- Issued Unclaimed Shares -->
                <div class="mt-4">
                    <h3 class="text-xl font-semibold mb-2">Issued Unclaimed Shares</h3>
                    {#if storageData?.issued_unclaimed_shares2}
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="text-left p-2 bg-gray-200">Registry Number</th>
                                <th class="text-center p-2 bg-gray-200">Issuer</th>
                                <th class="text-right p-2 bg-gray-200">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if storageData?.issued_unclaimed_shares2 && storageData.issued_unclaimed_shares2.size > 0}
                                {#each Array.from((storageData!.issued_unclaimed_shares2 as MichelsonMap<any, any>).entries()) as [_, ticket]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">{ticket.value}</td>
                                    <td class="text-center p-2">{ticket.ticketer}</td>
                                    <td class="text-right p-2">{ticket.amount}</td>
                                </tr>    
                                {/each}
                            {:else}
                            <tr class="border-t">
                                <td class="text-center p-2 text-gray-500" colspan="3">No unclaimed shares</td>
                            </tr>
                            {/if}
                        </tbody>
                    </table>
                    {/if}
                </div>

                <!-- Share Balances (Owned Company Shares) -->
                <div class="mt-4">
                    <h3 class="text-xl font-semibold mb-2">Owned Company Shares</h3>
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="text-left p-2 bg-gray-200">Address</th>
                                <th class="text-right p-2 bg-gray-200">Shares owned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if storageData?.share_balances && storageData.share_balances.size > 0}
                                {#each storageData.share_balances.entries() as [address, shares]}
                                    <tr class="border-t">
                                        <td class="font-mono p-2">{address}</td>
                                        <td class="text-right p-2">{shares.amount}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr class="border-t">
                                    <td class="text-center p-2 text-gray-500" colspan="2">No shares owned</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
            {/if}
        </div>

        <!-- TzKT Contract Storage Display -->
        <div>
            {#if tzktStorageData}
            <div class="mb-8 p-4 bg-gray-100 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">Contract Storage (TzKT API)</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="font-semibold">Registry Number:</span> 
                        <span>{tzktStorageData.registry_number || 'Not set'}</span>
                    </div>
                    <div>
                        <span class="font-semibold">Max Shares:</span> 
                        <span>{tzktStorageData.max_shares || 'Not set'}</span>
                    </div>
                    <div>
                        <span class="font-semibold">Issued Shares:</span> 
                        <span>{tzktStorageData.issued_shares}</span>
                    </div>
                    <div>
                        <span class="font-semibold">Allocated Shares:</span> 
                        <span>{tzktStorageData.allocated_shares}</span>
                    </div>
                    <div>
                        <span class="font-semibold">All Shares Issued:</span> 
                        <span>{tzktStorageData.all_shares_issued ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                        <span class="font-semibold">Contract admin:</span> 
                        <span>{tzktStorageData.admin_address}</span>
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
                            {#if tzktOwnersMapEntries.length > 0}
                                {#each tzktOwnersMapEntries as [address, shares]}
                                    <tr class="border-t">
                                        <td class="font-mono p-2">{address}</td>
                                        <td class="text-right p-2">{shares}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr class="border-t">
                                    <td class="text-center p-2 text-gray-500" colspan="2">No share owners registered</td>
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
                                <th class="text-left p-2 bg-gray-200">Registry Number</th>
                                <th class="text-center p-2 bg-gray-200">Issuer</th>
                                <th class="text-right p-2 bg-gray-200">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if tzktUnclaimedSharesEntries.length > 0}
                                {#each tzktUnclaimedSharesEntries as [_, ticket]}
                                    <tr class="border-t">
                                        <td class="font-mono p-2">{ticket.data}</td>
                                        <td class="text-center p-2">{ticket.address}</td>
                                        <td class="text-right p-2">{ticket.amount}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr class="border-t">
                                    <td class="text-center p-2 text-gray-500" colspan="3">No unclaimed shares</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>

                <!-- Share Balances (Owned Company Shares) -->
                <div class="mt-4">
                    <h3 class="text-xl font-semibold mb-2">Owned Company Shares</h3>
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="text-left p-2 bg-gray-200">Address</th>
                                <th class="text-right p-2 bg-gray-200">Shares owned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if tzktShareBalancesEntries.length > 0}
                                {#each tzktShareBalancesEntries as [_, shares]}
                                    <tr class="border-t">
                                        <td class="font-mono p-2">{shares.address}</td>
                                        <td class="text-right p-2">{shares.amount}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr class="border-t">
                                    <td class="text-center p-2 text-gray-500" colspan="2">No shares owned</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
            {/if}
        </div>
    </div>
</div>
