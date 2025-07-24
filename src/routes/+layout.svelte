<script lang="ts">
  import '../new_app.css';

  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import miracapLogo from '../assets/logo.svg';
  import { terminology } from '$lib/utils/terminology';

  // Import our new shared store
  import { showContractLoaderStore } from '$lib/stores/uiStore';

  let WalletConnectorBeacon: any;
  
  onMount(async () => {
    if (browser) {
      const { default: WalletConnectorBeaconComponent } = await import('$lib/WalletConnectorBeacon.svelte');
      WalletConnectorBeacon = WalletConnectorBeaconComponent;
    }
  });

  let sidebarOpen = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<main class="min-h-screen bg-(--background) grid grid-rows-[auto_1fr]">
  <!-- Sticky Navbar -->
  <div class="sticky top-0 z-50 navbar p-4 shadow-md">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src={miracapLogo} alt="Miracap Logo" class="h-8" />
        </div>
        <div class="flex items-center ml-auto">
          {#if browser && WalletConnectorBeacon}
            <svelte:component this={WalletConnectorBeacon} navbarMode={true} />
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="layout-container">
    <!-- Sidebar -->
    <div class="sidebar {sidebarOpen ? 'w-48' : 'w-16'} md:{sidebarOpen ? 'w-48' : 'w-16'} bg-(--card) border-r border-(--border) transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden {sidebarOpen ? 'open' : ''}">
      <nav class="{sidebarOpen ? 'p-4' : 'p-2'} space-y-2 flex-1 overflow-y-auto">
        <!-- Toggle Button at Top -->
        <button 
          class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} w-full rounded-lg hover:bg-(--muted) transition-colors text-(--foreground) group mb-4"
          onclick={toggleSidebar}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}" />
          </svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Collapse</span>
        </button>
        
        <a href="/" class="flex items-center {sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'} rounded-lg hover:bg-(--muted) transition-colors text-(--foreground) group" title="Dashboard">
          <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4" /></svg>
          <span class="{sidebarOpen ? 'block' : 'hidden'} whitespace-nowrap">Dashboard</span>
        </a>
        <!-- Other links... -->
      </nav>
      
      <button 
        class="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-(--border) hover:bg-(--muted) transition-all duration-200 bg-transparent text-(--foreground) hover:text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 shrink-0 opacity-0 hover:opacity-100 group"
        aria-label="Toggle View"
        onclick={() => showContractLoaderStore.update(value => !value)}
        style="min-width:0;"
      >
        <!-- The text now reacts to changes in the store -->
        <span class="text-sm font-medium {sidebarOpen ? 'block' : 'hidden'}">
          {$showContractLoaderStore ? terminology.MANAGE_DEPLOYED_WALLETS : terminology.VIEW_CONTRACTS}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--foreground)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>
    </div>

    <!-- Mobile overlay -->
    {#if sidebarOpen}
      <div class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onclick={toggleSidebar}></div>
    {/if}

    <!-- Main Content Area -->
    <div class="overflow-y-auto h-full">
      <slot />
    </div>
  </div>
</main>

<!-- Styles are unchanged -->
<style>
:global(body) {
  background: var(--background);
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

:global(#svelte) {
  height: 100vh;
}

main {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.layout-container {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .layout-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}

:global(.card) {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 2rem 1.5rem;
  color: var(--foreground);
  border: 1px solid var(--border);
}

:global(.theme-dark-gold) .card,
:global(.dark) .card {
  box-shadow: 0 4px 24px 0 rgba(20,33,61,0.12);
  border: 1.5px solid var(--border);
}
:global(.card h2), :global(.card h3), :global(.card h4) {
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 0.5rem;
  position: relative;
}
:global(.card h2::after), :global(.card h3::after) {
  content: '';
  display: block;
  width: 48px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
  margin-top: 0.5rem;
}
:global(button:hover) {
  background: var(--muted);
  color: var(--accent);
}
@media (max-width: 640px) {
  :global(.card) {
    padding: 1rem 0.5rem;
  }
  :global(.max-w-3xl) {
    max-width: 100vw;
  }
}
</style>
