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

<main class="min-h-screen bg-gray-50">
  <div class="max-w-3xl mx-auto bg-white shadow-sm min-h-screen">
    <!-- App Header -->
    <div class="border-b p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="./src/assets/miracap_logo-Photoroom.png" alt="Miracap Logo" class="h-8 w-8 rounded-full" />
          <span class="font-bold text-xl">miracap</span>
        </div>
        <button 
          class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          aria-label="Toggle View"
          on:click={handleToggle}
        >
          <span class="text-sm font-medium text-gray-700">
            {showContractLoader ? 'Create Company' : 'View Contracts'}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 text-gray-600" 
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
        <div class="mt-4">
          <ContractLoader />
        </div>
      {:else}
        <div class="mt-4">
          <CreateCompany />
        </div>
      {/if}
    </div>
  </div>
</main>

<style>


</style>
