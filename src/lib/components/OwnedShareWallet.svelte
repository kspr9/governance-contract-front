<script lang="ts">
  /**
   * Owned Share Wallet Component
   * Shows user's share portfolio and provides claim functionality
   */
  
  import { shareLedgerStore } from '../stores/shareLedgerStore.svelte';
  import { contractState, contractInstance } from '../stores/contractStore.svelte';
  import { beaconState } from '../stores/beaconStore.svelte';
  import { resetProvider } from '../config/beaconConfig';
  import { toastStore } from '../stores/toastStore.svelte';
  import OwnedShareCard from './OwnedShareCard.svelte';
  import LoadingDots from './LoadingDots.svelte';
  import { terminology } from '../utils/terminology';
  import HelpTip from './HelpTip.svelte';
  import CollapsibleSection from './shared/CollapsibleSection.svelte';
  
  let { 
    maxSharesCache,
    maxSharesLoading,
    handleLoadContract
  }: {
    maxSharesCache: Record<string, { max_shares: number, issued_shares?: number, registry_number?: string }>;
    maxSharesLoading: Record<string, boolean>;
    handleLoadContract: (address: string) => Promise<void>;
  } = $props();
  
  let { state: shareLedgerState } = shareLedgerStore;
  
  // State for claim forms
  let userForms = $state({
    claimShares: { address: '' }
  });
  
  // Loading states
  let loadingStates = $state({
    claimShares: false
  });
  
  // Error states
  let errorStates = $state({
    claimShares: null as string | null
  });
  
  // Collapsible state
  let showPortfolio = $state(true);
  let showClaimForm = $state(false);
  
  async function handleClaimShares(event: Event) {
    event.preventDefault();
    loadingStates.claimShares = true;
    errorStates.claimShares = null;
    
    try {
      await resetProvider();
      const contract = $contractInstance;
      if (!contract) {
        throw new Error('Contract instance not found');
      }
      const operation = await contract.methodsObject.claim_shares(
        userForms.claimShares.address
      ).send();
      
      const result = await operation.confirmation(2);
      console.log("Shares claimed successfully");
      
      toastStore.add('success', 'Shares claimed successfully', result.hash);
      userForms.claimShares.address = '';
      await handleLoadContract($contractState.contractAddress || '');
    } catch (error) {
      console.error("Failed to claim shares:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim shares';
      errorStates.claimShares = errorMessage;
      toastStore.add('error', errorMessage);
    } finally {
      loadingStates.claimShares = false;
    }
  }
  
</script>

<div class="space-y-6">
  <!-- Portfolio Section -->
  <CollapsibleSection title="{terminology.HELD_SHARES}" tooltip="Shares you own from various companies" bind:open={showPortfolio}>
    
    <div class="space-y-4 mx-0">
      {#if shareLedgerState.heldExternalShares.length > 0}
        {#each shareLedgerState.heldExternalShares as [_, ticket] (ticket.address)}
          <OwnedShareCard
            {ticket}
            {maxSharesCache}
            {maxSharesLoading}
            {handleLoadContract}
          />
        {/each}
      {:else}
        <div class="text-center p-6 text-(--muted-foreground) bg-(--muted)/10 rounded-lg">
          <svg class="w-12 h-12 mx-auto mb-3 text-(--muted-foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p class="text-sm">No shares in your portfolio</p>
          <p class="text-xs mt-1">Claim shares to add them to your wallet</p>
        </div>
      {/if}
    </div>
  </CollapsibleSection>
  
  <!-- Claim Shares Section -->
  <CollapsibleSection title="{terminology.CLAIM_SHARES}" tooltip={terminology.HELP_CLAIM_SHARES} bind:open={showClaimForm}>
      <form class="space-y-3" onsubmit={(e) => handleClaimShares(e)}>
        <input 
          type="text" 
          class="input w-full"
          placeholder="Enter the issuing register's address to claim your allocated shares"
          bind:value={userForms.claimShares.address}
          disabled={loadingStates.claimShares}
        />
        {#if errorStates.claimShares}
          <div class="text-(--destructive)">{errorStates.claimShares}</div>
        {/if}
        <div class="flex justify-end">
          <button 
            type="submit"
            class="btn-primary"
            disabled={loadingStates.claimShares || !beaconState.isConnected}
          >
            {#if loadingStates.claimShares}
              Claiming<LoadingDots />
            {:else}
              {terminology.CLAIM_SHARES}
            {/if}
          </button>
        </div>
      </form>
  </CollapsibleSection>
  
  
  {#if !beaconState.isConnected}
    <div class="p-4 text-(--muted-foreground) bg-(--muted)/10 rounded-lg text-center">
      
    </div>
  {/if}
</div>

