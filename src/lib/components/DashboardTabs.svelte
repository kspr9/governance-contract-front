<script lang="ts">
  /**
   * Dashboard Tabs Component
   * Provides tabbed interface for Wallet, Share Register, and Company Admin views
   */
  
  import { terminology } from '../utils/terminology';
  import { beaconState } from '../stores/beaconStore.svelte';
  import { tzktStorageData } from '../stores/tzktStorage.svelte';
  import HelpTip from './HelpTip.svelte';
  
  let { 
    activeTab = 'wallet',
    onTabChange,
    children
  }: {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    children?: any;
  } = $props();
  
  // Check if current user is admin
  const isAdmin = $derived(
    beaconState.address !== null && 
    tzktStorageData.admin_address !== null && 
    beaconState.address === tzktStorageData.admin_address
  );
  
  function handleTabClick(tab: string) {
    activeTab = tab;
    onTabChange?.(tab);
  }
  
  // Use derived state for tabs to react to admin changes
  const tabs = $derived([
    { 
      id: 'wallet', 
      label: terminology.TAB_WALLET,
      helpText: 'View and manage your share portfolio'
    },
    { 
      id: 'register', 
      label: terminology.TAB_REGISTER,
      helpText: terminology.HELP_SHARE_REGISTER
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: terminology.TAB_ADMIN,
      helpText: 'Company management and administrative functions'
    }] : [])
  ]);
</script>

<div class="w-full">
  <!-- Tab Navigation -->
  <div class="border-b border-(--border) mb-6">
    <nav class="flex space-x-8" aria-label="Dashboard Tabs">
      {#each tabs as tab}
        <button
          type="button"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center"
          class:border-[color:var(--primary)]={activeTab === tab.id}
          class:text-[color:var(--primary)]={activeTab === tab.id}
          class:border-transparent={activeTab !== tab.id}
          class:text-[color:var(--muted-foreground)]={activeTab !== tab.id}
          class:hover:text-[color:var(--foreground)]={activeTab !== tab.id}
          class:hover:border-[color:var(--border)]={activeTab !== tab.id}
          onclick={() => handleTabClick(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
          <HelpTip text={tab.helpText} position="top" />
        </button>
      {/each}
    </nav>
  </div>
  
  <!-- Tab Content -->
  <div class="tab-content" role="tabpanel">
    {@render children?.(activeTab)}
  </div>
</div>

<style>
  .tab-content {
    min-height: 200px;
  }
</style>
