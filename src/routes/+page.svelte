<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  import LoadContractForm from '$lib/components/LoadContractForm.svelte';
  import backgroundImage from '../assets/background.jpg';
  import blockImage from '../assets/block.png';
  import registerLogo from '../assets/2riregister-logo.png';

  // Import our new shared store
  import { showContractLoaderStore } from '$lib/stores/uiStore';
  import { contractState } from '$lib/stores/contractStore.svelte';

  // These components are specific to this page, so their imports are here.
  let ContractLoader: any;
  let CreateCompany: any;
  let contractStateInstance: any;
  
  onMount(async () => {
    if (browser) {
      const [
        { default: ContractLoaderComponent },
        { default: CreateCompanyComponent },
        { contractState: cs }
      ] = await Promise.all([
        import('$lib/components/ContractLoader.svelte'),
        import('$lib/CreateCompany.svelte'),
        import('$lib/stores/contractStore.svelte')
      ]);
      
      ContractLoader = ContractLoaderComponent;
      CreateCompany = CreateCompanyComponent;
      contractStateInstance = cs;
    }
  });

  // REMOVED: Local state and toggle function are no longer needed.
  // let showContractLoader = true;
  // function handleToggle() { ... }

  let contractLoaderRef: any;

  function handleViewContract(contractAddress: string) {
    // Instead of calling a local function, we now directly set the store's value.
    showContractLoaderStore.set(true);

    if (contractStateInstance) {
      contractStateInstance.update((state: any) => ({ ...state, contractAddress }));
    }
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

<!-- 
  The markup now uses the store's value directly.
  The '$' prefix makes the component react to any changes in the store.
-->
{#if $showContractLoaderStore}
  <!-- Hero Section with Background -->
  <div class="hero-section relative {!$contractState.isLoaded ? 'min-h-[40vh]' : 'min-h-[160px]'} flex items-center justify-center">
    <!-- Background Image -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg"></div>
    
    <!-- Hero Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white w-full">
      {#if !$contractState.isLoaded}
        <h1 class="text-4xl md:text-5xl font-bold mb-8">
          Search for a Company Share Register
        </h1>
        
        <!-- Search Form -->
        <div class="max-w-4xl mx-auto mb-8 w-full">
          <LoadContractForm {handleLoadContract} />
        </div>
        
        <!-- Additional Information -->
        <div class="text-lg md:text-xl space-y-2">
          <p>It is possible to make inquires about all legal persons.</p>
          <p>A contractual client has even more functionalities.</p>
        </div>
      {:else}
        <!-- Compact search form when contract is loaded -->
        <div class="max-w-4xl mx-auto mb-8 w-full">
          <LoadContractForm {handleLoadContract} />
        </div>
      {/if}
    </div>
  </div>

  <!-- Contract Loader Section - positioned to overlap hero when contract is loaded -->
  {#if browser && ContractLoader}
    <div class="max-w-5xl mx-auto px-4 {!$contractState.isLoaded ? '' : '-mt-16 relative z-20'}">
        <svelte:component this={ContractLoader} bind:this={contractLoaderRef} />
    </div>
  {/if}

  <!-- Main Content Section - only show when no contract is loaded -->
  {#if !$contractState.isLoaded}
    <div class="bg-white py-12">
      <div class="max-w-5xl mx-auto px-4">
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tokenized equity that actually means ownership
          </h2>
          <p class="text-xl text-gray-600">
            Legally compliant and officially registered on the Estonian Business Register.
          </p>
        </div>
        
        <!-- Feature Diagram -->
        <div class="max-w-5xl mx-auto">
          <div class="bg-gray-50 rounded-xl p-12 shadow-sm">
            <div class="flex items-center justify-center space-x-16">
              <!-- RWA Tokenization -->
              <div class="text-center">
                <h3 class="font-normal text-gray-900 text-xl">RWA Tokenization</h3>
                <div class="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <img src={blockImage} alt="RWA Tokenization" class="w-full h-full object-contain" />
                </div>
              </div>
              
              <!-- Connection Arrow -->
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
              </div>
              
              <!-- Estonian Business Register -->
              <div class="text-center">
                <h3 class="font-normal text-gray-900 text-xl">Estonian Business Register</h3>
                <div class="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <img src={registerLogo} alt="Estonian Business Register" class="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  {:else}
    <div class="max-w-5xl mx-auto p-4 space-y-4">
      <div class="card">
        {#if browser && CreateCompany}
          <svelte:component this={CreateCompany} onViewContract={handleViewContract} />
        {/if}
      </div>
    </div>
  {/if}

<style>
  .hero-section {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
    position: relative;
  }
  
  .hero-bg {
    background-image: url('../assets/background.jpg');
  }
</style>
