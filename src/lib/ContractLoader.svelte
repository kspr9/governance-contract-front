<script lang="ts">
    import { onMount } from "svelte";
    import { contractState } from './stores/contractStore.svelte';
    import { tzktStorageData } from './stores/tzktStorage.svelte';
    import ContractOps from "./ContractOps.svelte";
    import { loadContractTzkt } from './utils/contractLoader';
    import CreateCompany from "./CreateCompany.svelte";
    
    interface TzktTicket {
        data: string;
        amount: string;
        address: string;
    }

    let tzktEligibleClaimantsEntries = $state<[string, string][]>([]);
    let tzktUnclaimedSharePoolEntries = $state<[string, TzktTicket][]>([]);
    let tzktHeldExternalSharesEntries = $state<[string, TzktTicket][]>([]);
    let tzktShareLedgerEntries = $state<[string, string][]>([]);

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

    async function handleLoadContract() {
        const entries = await loadContractTzkt();
        tzktEligibleClaimantsEntries = entries.eligibleClaimantsEntries;
        tzktUnclaimedSharePoolEntries = entries.unclaimedSharePoolEntries;
        tzktHeldExternalSharesEntries = entries.heldExternalSharesEntries;
        tzktShareLedgerEntries = entries.shareLedgerEntries;
    }

</script>

<div class="container mx-auto p-4">
    <CreateCompany />
    
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
                onclick={handleLoadContract}
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
                    <span class="font-semibold">Contract admin:</span> 
                    <span>{tzktStorageData.admin_address}</span>
                </div>
                <div>
                    <span class="font-semibold">Issued Shares:</span> 
                    <span>{tzktStorageData.issued_shares}</span>
                </div>
                <div>
                    <span class="font-semibold">Total Allocated Shares:</span> 
                    <span>{tzktStorageData.total_allocated_shares}</span>
                </div>
            </div>

            <!-- Issued Unclaimed Shares -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Unclaimed Share Pool</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Issuer</th>
                            <th class="text-right p-2 bg-gray-200">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if tzktUnclaimedSharePoolEntries.length > 0}
                            {#each tzktUnclaimedSharePoolEntries as [_, ticket]}
                                <tr class="border-t">
                                    <td class="text-left p-2">{ticket.address}</td>
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
            
            <!-- Eligible Claimants -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Eligible Claimants</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Address</th>
                            <th class="text-right p-2 bg-gray-200">Entitled Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if tzktEligibleClaimantsEntries.length > 0}
                            {#each tzktEligibleClaimantsEntries as [address, shares]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">
                                        {#if address.startsWith('KT1')}
                                            <button 
                                                class="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                                onclick={() => {
                                                    $contractState.contractAddress = address;
                                                    handleLoadContract();
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
                                <td class="text-center p-2 text-gray-500" colspan="2">No eligible claimants registered</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Share Ledger -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Share Ledger</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Address</th>
                            <th class="text-right p-2 bg-gray-200">Owned Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if tzktShareLedgerEntries.length > 0}
                            {#each tzktShareLedgerEntries as [address, claimedShares]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">
                                        {#if address.startsWith("KT1")}
                                            <button 
                                                class="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                                onclick={() => {
                                                    $contractState.contractAddress = address;
                                                    handleLoadContract();
                                                }}
                                            >
                                                {address}
                                            </button>
                                        {:else}
                                            {address}
                                        {/if}
                                    </td>
                                    <td class="text-right p-2">{claimedShares}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr class="border-t">
                                <td class="text-center p-2 text-gray-500" colspan="2">No share ledger entries</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Held External Shares -->
            <div class="mt-4">
                <h3 class="text-xl font-semibold mb-2">Held External Shares</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="text-left p-2 bg-gray-200">Address</th>
                            <th class="text-right p-2 bg-gray-200">Shares held</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if tzktHeldExternalSharesEntries.length > 0}
                            {#each tzktHeldExternalSharesEntries as [_, shares]}
                                <tr class="border-t">
                                    <td class="font-mono p-2">
                                        <button 
                                            class="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            onclick={() => {
                                                $contractState.contractAddress = shares.address;
                                                handleLoadContract();
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
                                <td class="text-center p-2 text-gray-500" colspan="2">No external shares held</td>
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
