<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  import LoadContractForm from '$lib/components/LoadContractForm.svelte';
  import backgroundImage from '../assets/background.jpg';
  import blockImage from '../assets/RWA.svg';
  import registerLogo from '../assets/businessRegisterRound.svg';
  import arrowsIcon from '../assets/arrows.svg';

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
  <div class="hero-section relative {!$contractState.isLoaded ? 'min-h-[28vh]' : 'min-h-[160px]'} flex items-center justify-center">
    <!-- Background Image -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg"></div>
    
    <!-- Contract Loader Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white w-full">
      {#if !$contractState.isLoaded}
        <h1 class="text-4xl md:text-3xl font-medium mb-8">
          Load Tokenized Share Register
        </h1>
        
        <!-- Search Form -->
        <div class="max-w-xl mx-auto mb-8 w-full">
          <LoadContractForm {handleLoadContract} />
        </div>
        
        <!-- Additional Information -->
        <div class="text-sm md:text-base space-y-0.1">
          <p>It is possible to make inquires about all legal persons.</p>
          <p>A contractual client has even more functionalities.</p>
        </div>
      {:else}
        <!-- Compact search form when contract is loaded -->
        <div class="max-w-xl mx-auto mb-8 w-full">
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
    <div style="background-color: var(--background)" class="py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Combined hero text and feature diagram container -->
        <div style="background-color: var(--card)" class="rounded-xl p-12 shadow-sm">
          <!-- Hero Text Section -->
          <div class="text-center">
            <h2 class="text-4xl md:text-5xl font-medium mb-4" style="color: var(--primary)">
              Tokenized equity that actually means ownership
            </h2>
          </div>
          
          <div class="h-0.5 mx-auto mb-4" style="width: 100%; background-color: var(--border)"></div>

          <div class="text-center mb-12" style="width: 70%; margin: 0 auto;">
            <p class="text-xl" style="color: var(--muted-foreground)">
              Legally compliant and officially registered on the Estonian Business Register.
            </p>
          </div>

          <!-- Feature Diagram -->
          <div class="flex items-center justify-center space-x-8 pt-10">
            <!-- RWA Tokenization Card -->
            <div class="feature-card" style="background-color: var(--muted)">
              <h3 class="font-semibold text-xl mb-4" style="color: var(--foreground)">RWA Tokenization</h3>
              <div class="w-36 h-36 mx-auto flex items-center justify-center">
                <img src={blockImage} alt="RWA Tokenization" class="w-full h-full object-contain" />
              </div>
            </div>
            
            <!-- Connection Arrow -->
            <div class="flex items-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <img src={arrowsIcon} alt="Connection arrows" class="w-full h-full object-contain" />
              </div>
            </div>
            
            <!-- Estonian Business Register Card -->
            <div class="feature-card" style="background-color: var(--muted)">
              <h3 class="font-semibold text-xl mb-4" style="color: var(--foreground)">Estonian Business Register</h3>
              <div class="w-36 h-36 mx-auto flex items-center justify-center">
                <img src={registerLogo} alt="Estonian Business Register" class="w-full h-full object-contain" />
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
  .feature-card {
    text-align: center;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
    width: 18rem;
    height: 14rem;
  }
</style>
