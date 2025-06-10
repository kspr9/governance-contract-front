<script lang="ts">

  //import TestGlobal from './lib/TestGlobal.svelte'

  import WalletConnectorBeacon from './lib/WalletConnectorBeacon.svelte'

  import ContractLoader from '$lib/ContractLoader.svelte';
  import NewContract from '$lib/NewContract.svelte';
    import CreateCompany from '$lib/CreateCompany.svelte';

  let showContractLoader = true;

  function handleToggle() {
    showContractLoader = !showContractLoader;
  }
</script>

<main class="min-h-screen bg-[color:var(--background)]">
  <div class="max-w-3xl mx-auto bg-[color:var(--card)] shadow-lg min-h-screen rounded-xl p-2 border border-[color:var(--border)]">
    <!-- App Header -->
    <div class="border-b border-[color:var(--border)] p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="./src/assets/miracap_logo-Photoroom.png" alt="Miracap Logo" class="h-8 w-8 rounded-full border-2 border-[color:var(--primary)] bg-[color:var(--background)]" />
          <span class="font-bold text-xl text-[color:var(--primary)]">miracap</span>
        </div>
        <button 
          class="flex items-center gap-2 px-3 py-2 rounded-lg border border-[color:var(--border)] hover:bg-[color:var(--muted)] transition-colors bg-[color:var(--background)] text-[color:var(--primary)] hover:text-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          aria-label="Toggle View"
          on:click={handleToggle}
        >
          <span class="text-sm font-medium">
            {showContractLoader ? 'Create Company' : 'View Contracts'}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 text-[color:var(--primary)]" 
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
    <!-- Main Content -->
    <div class="p-4 space-y-4">
      <div class="mt-4">
        <WalletConnectorBeacon />
      </div>
      <!-- <div class="mt-4">
        <NewContract />
      </div> -->
      {#if showContractLoader}
        <div class="mt-4 card">
          <ContractLoader />
        </div>
      {:else}
        <div class="mt-4 card">
          <CreateCompany />
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
:global(body) {
  background: var(--background);
}
.card {
  background: var(--card);
  border-radius: 1rem;
  box-shadow: 0 4px 24px 0 rgba(20,33,61,0.12);
  padding: 2rem 1.5rem;
  color: var(--foreground);
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
