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
  let sidebarOpen = false;

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

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<main class="min-h-screen bg-[color:var(--background)]">
  <!-- Sticky Navbar -->
  <div class="sticky top-0 z-50 bg-[color:var(--primary)] text-white p-4 shadow-md">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="./src/assets/Miracap_logo_white.png" alt="Miracap Logo" class="h-8" />
          <!-- <span class="poppins-semibold text-2xl text-white">miracap</span> -->
        </div>
        <div class="flex items-center ml-auto">
          <WalletConnectorBeacon navbarMode={true} />
        </div>
      </div>
    </div>
  </div>

  <!-- Layout Container -->
  <div class="flex">
    <!-- Sidebar -->
    <div class="{sidebarOpen ? 'w-48' : 'w-16'} md:{sidebarOpen ? 'w-48' : 'w-16'} fixed md:static top-[72px] md:top-0 left-0 z-40 min-h-screen bg-[color:var(--card)] border-r border-[color:var(--border)] transition-all duration-300 ease-in-out overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-[color:var(--border)] md:hidden">
        <span class="poppins-semibold text-lg text-[color:var(--primary)] {sidebarOpen ? 'block' : 'hidden'}">
          Menu
        </span>
        <button 
          class="p-2 rounded-lg hover:bg-[color:var(--muted)] transition-colors {sidebarOpen ? 'block' : 'hidden'}"
          on:click={toggleSidebar}
          aria-label="Close Sidebar"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="{sidebarOpen ? 'p-4' : 'p-2'} space-y-2 flex-1">
        <!-- Toggle Button at Top -->
        <button 
          class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} w-full rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group mb-4"
          on:click={toggleSidebar}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Collapse</span>
        </button>
        
        <a href="#" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group" title="Dashboard">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Dashboard</span>
        </a>
        <a href="#" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group" title="Contracts">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Contracts</span>
        </a>
        <a href="#" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group" title="Wallets">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Wallets</span>
        </a>
        <a href="#" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group" title="Companies">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Companies</span>
        </a>
        <a href="#" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group" title="Settings">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Settings</span>
        </a>
      </nav>
      <button 
        class="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors bg-transparent text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 mt-auto"
        aria-label="Toggle View"
        on:click={handleToggle}
        style="min-width:0;"
      >
        <span class="text-sm font-medium {sidebarOpen ? 'block' : 'hidden'}">
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

    <!-- Mobile overlay -->
    {#if sidebarOpen}
      <div class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" on:click={toggleSidebar}></div>
    {/if}

    <!-- Main Content -->
    <div class="flex-1">
      <div class="max-w-5xl mx-auto p-4 space-y-4">
        {#if showContractLoader}
          <div>
            <LoadContractForm {handleLoadContract} />
          </div>
        {/if}
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
    </div>
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
