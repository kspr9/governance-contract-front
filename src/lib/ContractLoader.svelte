<script lang="ts">
    import { onMount } from "svelte";
    import { contractState } from './stores/contract';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import { TezosToolkit } from '@taquito/taquito';
    import { writable } from 'svelte/store';
    import ContractOps from "./ContractOps.svelte";
    
    interface TzktTicket {
        data: string;
        amount: string;
        address: string;
    }


/**
 * 

 interface TzktStorageData {
     max_shares: string | null;
     owners_map: Record<string, string> | null;
     admin_address: string | null;
     issued_shares: string | null;
     share_balances: Record<string, TzktTicket> | null;
     registry_number: string | null;
     allocated_shares: string | null;
     all_shares_issued: boolean;
     issued_unclaimed_shares2: Record<string, TzktTicket> | null;
 }



 export const tzktStorageData = $state<TzktStorageData>({
     max_shares: null,
     owners_map: null,
     admin_address: null,
     issued_shares: null,
     share_balances: null,
     registry_number: null,
     allocated_shares: null,
     all_shares_issued: false,
     issued_unclaimed_shares2: null
 });
 */


   

    

    let tzktOwnersMapEntries = $state<[string, string][]>([]);
    let tzktUnclaimedSharesEntries = $state<[string, TzktTicket][]>([]);
    let tzktShareBalancesEntries = $state<[string, TzktTicket][]>([]);

    /**
     * Test contracts
     * KT1SP3hazeQKE1Sk8MKaCED86GPGhyX2Jyu3
     * KT1SJjCTroZ3NgZJSqZp48EXWknGntFWVSKC
    */

    onMount(async () => {
        try {
            
        } catch (err) {
            console.error(err);

        }
    });


    async function loadContractTzkt() {
        try {
            const response = await fetch(`https://api.ghostnet.tzkt.io/v1/contracts/${$contractState.contractAddress}/storage`);
            const data = await response.json();
            
            // Update all properties
            Object.assign(tzktStorageData, data);
            
            // Update individual properties
            /*
            *tzktStorageData.max_shares = data.max_shares;
            tzktStorageData.owners_map = data.owners_map;
            tzktStorageData.admin_address = data.admin_address;
            tzktStorageData.issued_shares = data.issued_shares;
            tzktStorageData.share_balances = data.share_balances;
            tzktStorageData.registry_number = data.registry_number;
            tzktStorageData.allocated_shares = data.allocated_shares;
            tzktStorageData.all_shares_issued = data.all_shares_issued;
            tzktStorageData.issued_unclaimed_shares2 = data.issued_unclaimed_shares2;
            */
            

            // Process owners map
            tzktOwnersMapEntries = Object.entries(tzktStorageData.owners_map ?? {});

            // Process unclaimed shares
            tzktUnclaimedSharesEntries = Object.entries(tzktStorageData.issued_unclaimed_shares2 ?? {});

            // Process share balances
            tzktShareBalancesEntries = Object.entries(tzktStorageData.share_balances ?? {});

            // Log just the data we care about
            console.log('TzKT Storage Data:', {
                max_shares: tzktStorageData.max_shares,
                admin_address: tzktStorageData.admin_address,
                issued_shares: tzktStorageData.issued_shares,
                owners_map: tzktOwnersMapEntries,
                unclaimed: tzktUnclaimedSharesEntries,
                balances: tzktShareBalancesEntries
            });
        } catch (error) {
            console.error("Failed to load contract from TzKT API:", error);
        }
    }



</script>

<div class="container mx-auto p-4">
    <!-- Contract Loading -->
    <div class="mb-8">
        <div class="flex gap-4">
            <input 
                class="flex-1 p-2 border rounded" 
                bind:value={$contractState.contractAddress} 
                placeholder="Enter contract address" 
            />
            <button 
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onclick={loadContractTzkt}
            >
                Load Contract (TzKT 2)
            </button>
        </div>
    </div>

    <!-- TzKT Contract Storage Display -->
    {#if tzktStorageData.admin_address !== null}
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
                                    <td class="font-mono p-2">
                                        {#if address.startsWith('KT1')}
                                            <button 
                                                class="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                                onclick={() => {
                                                    $contractState.contractAddress = address;
                                                    loadContractTzkt();
                                                }}
                                            >
                                                {address}
                                            </button>
                                        {:else}
                                            {address}
                                        {/if}
                                    </td>
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
                                    <td class="font-mono p-2">
                                        <button 
                                            class="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            onclick={() => {
                                                $contractState.contractAddress = shares.address;
                                                loadContractTzkt();
                                            }}
                                        >
                                            {shares.address}
                                        </button>
                                    </td>
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

    {#if $contractState.contractAddress !== null}
        <div>
            <h2 class="text-2xl font-bold mb-4">Contract Operations</h2>
            <ContractOps />
        </div>
    {/if}
</div>
