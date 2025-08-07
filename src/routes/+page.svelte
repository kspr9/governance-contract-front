<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { FileDigit } from 'lucide-svelte';
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  import LoadContractForm from '$lib/components/LoadContractForm.svelte';
  import backgroundImage from '../assets/background.jpg';
  import blockImage from '../assets/RWA.svg';
  import registerLogo from '../assets/businessRegisterRound.svg';
  import arrowsIcon from '../assets/arrows.svg';

  import { showContractLoaderStore } from '$lib/stores/uiStore';
  import { contractState } from '$lib/stores/contractStore.svelte';

  let ContractLoader = $state<any>(null);
  let CreateCompany = $state<any>(null);

  onMount(async () => {
    if (browser) {
      const [{ default: ContractLoaderComponent }, { default: CreateCompanyComponent }] = await Promise.all([
        import('$lib/components/ContractLoader.svelte'),
        import('$lib/CreateCompany.svelte')
      ]);
      ContractLoader = ContractLoaderComponent;
      CreateCompany = CreateCompanyComponent;
    }
  });

  let contractLoaderRef: any = $state(null);
  const testContractAddress = "KT1Wpmwa141oc9SHbhRK6Yn8UqAcFduSAJZg";

  function handleViewContract(contractAddress: string) {
    showContractLoaderStore.set(true);
    if (contractLoaderRef) {
        contractLoaderRef.handleLoadContract(contractAddress);
    }
  }

  async function handleLoadContract(address: string) {
    if (contractLoaderRef) {
      await contractLoaderRef.handleLoadContract(address);
    } else {
      console.error('ContractLoader ref not available');
    }
  }

  // Custom transition for sliding content up behind the background
  function slideUpBehind(node: HTMLElement, params: any) {
    return {
      duration: 800, // Slower animation
      easing: quintOut,
      css: (t: number) => `
        transform: translateY(${(1 - t) * -100}vh);
        opacity: ${t};
      `
    };
  }

  function slideDownFrom(node: HTMLElement, params: any) {
    return {
      duration: 800,
      easing: quintOut,
      css: (t: number) => `
        position: absolute;
        top: -4rem;
        max-width: 64rem;
        left: 0%;
        margin: 0 auto;
        padding: 0 1rem;
        width: 100%;
        transform: translateY(${(1 - t) * 100}vh);
        opacity: ${t};
      `
    };
  }
</script>

<!-- Always render ContractLoader but hide it visually until needed -->
<div style="display: none;">
  {#if browser && ContractLoader}
    <ContractLoader bind:this={contractLoaderRef} />
  {/if}
</div>

{#if $showContractLoaderStore}
  <!-- LoadContrcatForm with Background -->
  <div class="load-contract-form-section" class:loaded={$contractState.isLoaded}>
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg">      
    </div>
    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white w-full loadContractForm">
      {#if !$contractState.isLoaded}
        <h1 class="text-4xl md:text-3xl font-medium mb-8">
          Tokenized Share Register
        </h1>
      {/if}
      
      <div class="max-w-xl mx-auto w-full mb-8">
        <LoadContractForm {handleLoadContract} />
      </div>
      
      {#if !$contractState.isLoaded}
        <div class="text-sm md:text-base space-y-0.1">
          <p>To get a tokenized share register, contact us.</p>
          <p>A contractual client has even more functionalities.</p>
        </div>
      {/if}
    </div>
    
  </div>

  <!-- Content Section -->
  <div class="content-section">
    {#if !$contractState.isLoaded}
      <!-- Hero Content (initial state) - slides up behind background when transitioning -->
      <div class="hero-content" out:slideUpBehind|local={{}}>
        <div style="background-color: var(--card)" class="rounded-xl p-12 shadow-sm">
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

          <div class="flex items-center justify-center space-x-8 pt-10">
            <div class="feature-card" style="background-color: var(--muted)">
              <h3 class="font-semibold text-xl mb-4" style="color: var(--foreground)">RWA Tokenization</h3>
              <div class="w-36 h-36 mx-auto flex items-center justify-center">
                <img src={blockImage} alt="RWA Tokenization" class="w-full h-full object-contain" />
              </div>
            </div>
            
            <div class="flex items-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <img src={arrowsIcon} alt="Connection arrows" class="w-full h-full object-contain" />
              </div>
            </div>
            
            <div class="feature-card" style="background-color: var(--muted)">
              <h3 class="font-semibold text-xl mb-4" style="color: var(--foreground)">Estonian Business Register</h3>
              <div class="w-36 h-36 mx-auto flex items-center justify-center">
                <img src={registerLogo} alt="Estonian Business Register" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Contract Loader Content (final state) - slides down from above -->
      <div class="contract-loader-wrapper" in:slideDownFrom|local={{}}>
        <!-- The visible ContractLoader, driven by the same (now hidden) instance -->
        {#if browser && ContractLoader}
          <ContractLoader />
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="max-w-5xl mx-auto p-4 space-y-4">
    <div class="card">
      {#if browser && CreateCompany}
        <CreateCompany onViewContract={handleViewContract} />
      {/if}
    </div>
  </div>
{/if}

<!-- Test Contract Button -->
{#if $showContractLoaderStore}
  <button 
    class="fixed bottom-16 left-4 z-50 flex items-center justify-center p-2 rounded-lg border border-(--border) hover:bg-(--muted) transition-all duration-200 bg-transparent text-(--foreground) hover:text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 opacity-0 hover:opacity-100 group"
    aria-label="Load Test Contract"
    onclick={() => handleLoadContract(testContractAddress)}
    title="Load Test Contract: {testContractAddress}"
  >
    <FileDigit class="h-5 w-5 text-(--foreground)" />
  </button>
{/if}

<style>
  .load-contract-form-section {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: min-height 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 28vh;
  }
  
  .load-contract-form-section.loaded {
    min-height: 160px;
  }
  
  .loadContractForm {
    z-index: 20;
  }

  .hero-bg {
    background-image: url('../assets/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 5;
  }


  .content-section {
    position: relative;
    max-width: 64rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .hero-content {
    padding: 2rem 0;
    margin-top: 0;
    position: relative;
    z-index: auto; /* Behind the hero-bg (which has z-index from its parent at z-10) */
  }
  
  .contract-loader-wrapper {
    margin-top: -4rem; /* Pulls the contract loader up closer to header */
    position: relative;
    z-index: 10; /* Above everything when it slides in */
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
