<script lang="ts">
  import '../new_app.css';

  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import miracapLogo from '../assets/logo.svg';
  import { terminology } from '$lib/utils/terminology';
  import { ArrowRightLeft } from 'lucide-svelte';

  // Import our new shared store
  import { showContractLoaderStore } from '$lib/stores/uiStore';

  let WalletConnectorBeacon: any;
  
  onMount(async () => {
    if (browser) {
      const { default: WalletConnectorBeaconComponent } = await import('$lib/WalletConnectorBeacon.svelte');
      WalletConnectorBeacon = WalletConnectorBeaconComponent;
    }
  });


</script>

<main class="min-h-screen bg-(--background) grid grid-rows-[auto_1fr]">
  <!-- Sticky Navbar -->
  <div class="sticky top-0 z-50 navbar p-4 shadow-md">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button 
            onclick={() => window.location.reload()} 
            class="logo-button cursor-pointer border-none bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent focus:outline-none"
          >
            <img src={miracapLogo} alt="Miracap Logo" class="h-8" />
          </button>
        </div>
        <div class="flex items-center ml-auto">
          {#if browser && WalletConnectorBeacon}
            <svelte:component this={WalletConnectorBeacon} navbarMode={true} />
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="overflow-y-auto h-full">
    <slot />
  </div>

  <!-- Invisible Toggle Button - Bottom Left Corner -->
  <button 
    class="fixed bottom-4 left-4 z-50 flex items-center justify-center p-2 rounded-lg border border-(--border) hover:bg-(--muted) transition-all duration-200 bg-transparent text-(--foreground) hover:text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 opacity-0 hover:opacity-100 group"
    aria-label="Toggle View"
    onclick={() => showContractLoaderStore.update(value => !value)}
    title="{$showContractLoaderStore ? terminology.MANAGE_DEPLOYED_WALLETS : terminology.VIEW_CONTRACTS}"
  >
    <ArrowRightLeft class="h-5 w-5 text-(--foreground)" />
  </button>
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

:global(.logo-button):hover {
  background: none;
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
