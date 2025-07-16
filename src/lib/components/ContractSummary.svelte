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
</script>

{#if tzktStorageData.admin_address !== null}
<div class="rounded-lg shadow p-0 border border-[color:var(--border)] bg-[color:var(--card)]">
  <div class="px-6 py-4 flex items-center justify-between border-b border-[color:var(--border)]">
    <div>
      <div class="font-bold text-xl text-[color:var(--primary)]">
        {#if companyDataLoading}
          Loading company data<LoadingDots />
        {:else if companyData}
          {companyData.name}
        {:else}
          Share Register for Company {tzktStorageData.registry_number}
        {/if}
      </div>
      {#if companyData}
        <div class="text-sm text-[color:var(--muted-foreground)]">
          {terminology.REGISTRY_NUMBER}: {tzktStorageData.registry_number}
          {#if companyData.status}
            • Status: {companyData.status}
          {/if}
        </div>
        {#if companyData.address}
          <div class="text-sm text-[color:var(--muted-foreground)]">
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
  </div>
  <div class="px-6 py-4">
    <div class="text-sm text-[color:var(--muted-foreground)]">Company Share Register address</div>
    <div class="flex items-center gap-2 mb-4">
      <div
        class="flex-1 p-2 rounded font-mono text-sm cursor-default select-all text-[color:var(--foreground)]"
        style="min-width:0;"
      >
        {$contractState.contractAddress}
      </div>
      <button
        class="btn-icon"
        title={terminology.RELOAD_CONTRACT}
        aria-label={terminology.RELOAD_CONTRACT}
        onclick={() => handleLoadContract($contractState.contractAddress || '')}
      >
        <svg class="w-5 h-5 text-[color:var(--primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1, 1) translate(-24 0)"/>
        </svg>
      </button>
      <a
        class="btn-icon ml-1"
        href={`https://better-call.dev/mainnet/${$contractState.contractAddress}/operations`}
        target="_blank"
        rel="noopener noreferrer"
        title={terminology.VIEW_ON_EXPLORER}
        aria-label={terminology.VIEW_ON_EXPLORER}
      >
        <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.ADMIN_ADDRESS}</span>
        <div class="font-mono text-sm text-[color:var(--foreground)]">{tzktStorageData.admin_address}</div>
      </div>
      <div>
        <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.REGISTRY_NUMBER}</span>
        <div class="text-sm text-[color:var(--foreground)]">{tzktStorageData.registry_number || 'Not set'}</div>
      </div>
    </div>
    <div class="flex flex-row gap-8 justify-between border-t pt-4 border-[color:var(--border)]">
      <div class="flex-1">
        <span class="text-xs text-[color:var(--muted-foreground)] flex items-center">
          {terminology.MAX_SHARES}
          <HelpTip text="The maximum number of shares this company is authorized to issue" />
        </span>
        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.max_shares || 'Not set'}</div>
      </div>
      <div class="flex-1">
        <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.ISSUED_SHARES}</span>
        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.issued_shares}</div>
      </div>
      <div class="flex-1">
        <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.UNCLAIMED_SHARES}</span>
        <div class="text-2xl font-bold text-[color:var(--primary)]">{tzktStorageData.total_allocated_shares}</div>
      </div>
    </div>
  </div>
</div>
{/if}
