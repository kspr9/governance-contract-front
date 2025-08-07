<script lang="ts">
  /**
   * Contract Summary Card
   * Shows company information, registry details, and key share metrics
   */
  
  import { contractState } from '../stores/contractStore.svelte';
  import { tzktStorageData } from '../stores/tzktStorage.svelte';
  import LoadingDots from './LoadingDots.svelte';
  import { terminology } from '../utils/terminology';
  import HelpTip from './HelpTip.svelte';
  import { Card, CardContent } from './ui/card';
  import { RotateCw, ExternalLink } from 'lucide-svelte';
  
  let { 
    companyData, 
    companyDataLoading, 
    companyDataError,
    handleLoadContract 
  }: {
    companyData: { name: string; status: string; address?: string } | null;
    companyDataLoading: boolean;
    companyDataError: string | null;
    handleLoadContract: (address: string) => Promise<void>;
  } = $props();

  // Computed values for share metrics
  let totalClaimedShares = $derived(() => {
    if (!tzktStorageData.share_ledger) return 0;
    return Object.values(tzktStorageData.share_ledger).reduce((sum, amount) => sum + Number(amount), 0);
  });

  let totalUnclaimedShares = $derived(() => {
    if (!tzktStorageData.unclaimed_share_pool) return 0;
    return Object.values(tzktStorageData.unclaimed_share_pool).reduce((sum, ticket) => sum + Number(ticket.amount), 0);
  });

  // Share metrics data structure
  let shareMetrics = $derived([
    {
      title: terminology.MAX_SHARES,
      value: tzktStorageData.max_shares || 'Not set',
      helpText: 'The maximum number of shares this company is authorized to issue'
    },
    {
      title: terminology.ISSUED_SHARES,
      value: tzktStorageData.issued_shares,
      helpText: null
    },
    {
      title: terminology.CLAIMED_SHARES,
      value: totalClaimedShares(),
      helpText: 'Total number of shares that have been claimed by shareholders'
    },
    {
      title: terminology.TREASURY_SHARES,
      value: totalUnclaimedShares(),
      helpText: 'Shares that have been minted but not yet allocated to specific shareholders'
    },
    {
      title: terminology.ELIGIBLE_CLAIMANTS,
      value: tzktStorageData.total_allocated_shares,
      helpText: 'Total shares allocated to specific addresses but not yet claimed'
    }
  ]);
</script>

{#if tzktStorageData.admin_address !== null}
<div class="card">
  <div class="px-6 py-4 flex items-start justify-between border-b border-[color:var(--border)]">
    <div>
      <div class="text-heading-lg">
        {#if companyDataLoading}
          Loading company data<LoadingDots />
        {:else if companyData}
          {companyData.name}
        {:else}
          Share Register for Company {tzktStorageData.registry_number}
        {/if}
      </div>
      {#if companyData}
        {#if companyData.status}
          <div class="text-sm text-muted mt-1">
            Status: <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {companyData.status}
            </span>
          </div>
        {/if}
        <div class="text-sm text-muted mt-1">
          {terminology.REGISTRY_NUMBER_SMALL}: {tzktStorageData.registry_number}
        </div>
        {#if companyData.address}
          <div class="text-sm text-muted mt-1">
            {companyData.address}
          </div>
        {/if}
      {/if}
      {#if companyDataError}
        <div class="text-sm text-[color:var(--destructive)]">
          {companyDataError}
        </div>
      {/if}
    </div>
    <div class="flex items-center gap-2 mt-1">
      <button
        class="btn-icon"
        title={terminology.RELOAD_CONTRACT}
        aria-label={terminology.RELOAD_CONTRACT}
        onclick={() => handleLoadContract($contractState.contractAddress || '')}
      >
        <RotateCw class="w-5 h-5" style="color: var(--primary-foreground)" />
      </button>
      <a
        class="btn-icon"
        href={`https://better-call.dev/mainnet/${$contractState.contractAddress}/operations`}
        target="_blank"
        rel="noopener noreferrer"
        title={terminology.VIEW_ON_EXPLORER}
        aria-label={terminology.VIEW_ON_EXPLORER}
      >
        <ExternalLink class="w-5 h-5" style="color: var(--primary-foreground)" />
      </a>
    </div>
  </div>
  <div class="px-6 py-4">
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <span class="text-sm text-muted ">Company Share Register address</span>
        <div class="text-address">{$contractState.contractAddress}</div>
      </div>
      <div>
        <span class="text-sm text-muted">{terminology.ADMIN_ADDRESS}</span>
        <div class="text-address">{tzktStorageData.admin_address}</div>
      </div>
      <div>
        <span class="text-sm text-muted">{terminology.REGISTRY_NUMBER_SMALL}</span>
        <div class="text-address">{tzktStorageData.registry_number || 'Not set'}</div>
      </div>
    </div>
    <!-- Share Metrics -->
    <div class="border-t pt-4 border-[color:var(--border)]">
      <div class="grid grid-cols-5 gap-4">
        {#each shareMetrics as metric}
          <Card class="bg-[color:var(--muted)] border-[color:var(--border)]">
            <CardContent class="p-2 grid grid-rows-3 h-25">
              <div class="row-span-2 flex items-start">
                <span class="text-xs text-muted flex items-center pt-2 px-2">
                  {metric.title}
                  {#if metric.helpText}
                    <HelpTip text={metric.helpText} />
                  {/if}
                </span>
              </div>
              <div class="flex items-end px-2">
                <div class="text-stat ">{metric.value}</div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .btn-icon:hover {
    background-color: var(--card);
    color: var(--primary);
  }
</style>
