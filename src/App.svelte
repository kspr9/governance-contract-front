<script lang="ts">

  //import TestGlobal from './lib/TestGlobal.svelte'

  import WalletConnectorBeacon from './lib/WalletConnectorBeacon.svelte'

  import ContractLoader from '$lib/components/ContractLoader.svelte';

  import CreateCompany from '$lib/CreateCompany.svelte';
  import { contractState } from '$lib/stores/contractStore.svelte';
  import LoadContractForm from '$lib/components/LoadContractForm.svelte';
  import { terminology } from '$lib/utils/terminology';

  let showContractLoader = true;
  let contractLoaderRef: any;

  function handleToggle() {
    showContractLoader = !showContractLoader;
  }

  function handleViewContract(contractAddress: string) {
    showContractLoader = true;
    contractState.update(state => ({ ...state, contractAddress }));
    setTimeout(() => {
      contractLoaderRef?.handleLoadContract(contractAddress);
    });
  }

  async function handleLoadContract(address: string) {
    if (contractLoaderRef) {
      await contractLoaderRef.handleLoadContract(address);
    }
  }
</script>

<main class="min-h-screen bg-[color:var(--background)]">
  <!-- App Header - Full Width -->
  <div class="bg-[color:var(--primary)] text-white p-4">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="./src/assets/miracap_logo-Photoroom.png" alt="Miracap Logo" class="h-8 w-8 rounded-full border-2 border-white bg-white" />
          <span class="poppins-semibold text-2xl text-white">miracap</span>
        </div>
        <button 
          class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors bg-transparent text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Toggle View"
          on:click={handleToggle}
        >
          <span class="text-sm font-medium">
            {showContractLoader ? terminology.MANAGE_DEPLOYED_WALLETS : terminology.VIEW_CONTRACTS}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Main Content Container -->
  <div class="max-w-5xl mx-auto p-4 space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WalletConnectorBeacon />
      {#if showContractLoader}
        <LoadContractForm {handleLoadContract} />
      {/if}
    </div>
    {#if showContractLoader}
      <div>
        <ContractLoader bind:this={contractLoaderRef} />
      </div>
    {:else}
      <div class="card">
        <CreateCompany onViewContract={handleViewContract} />
      </div>
    {/if}
  </div>
</main>

<style>
:global(body) {
  background: var(--background);
}
.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 2rem 1.5rem;
  color: var(--foreground);
  border: 1px solid var(--border);
}

/* Dark theme specific card shadows */
:global(.theme-dark-gold) .card,
:global(.dark) .card {
  box-shadow: 0 4px 24px 0 rgba(20,33,61,0.12);
  border: 1.5px solid var(--border);
}
.card h2, .card h3, .card h4 {
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 0.5rem;
  position: relative;
}
.card h2::after, .card h3::after {
  content: '';
  display: block;
  width: 48px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
  margin-top: 0.5rem;
}
button:hover {
  background: var(--muted);
  color: var(--accent);
}
@media (max-width: 640px) {
  .card {
    padding: 1rem 0.5rem;
  }
  .max-w-3xl {
    max-width: 100vw;
  }
}
</style>
