<script lang="ts">

  import TestGlobal from './lib/TestGlobal.svelte'

  import WalletConnectorBeacon from './lib/WalletConnectorBeacon.svelte'

  import ContractLoader from '$lib/ContractLoader.svelte';

</script>

<main class="min-h-screen bg-gray-400 p-4 flex flex-col">
  <div class="flex-grow-0">

    <h1 class="text-3xl font-bold text-blue-600">TokenShare</h1>



    <div class="mt-4">
      <WalletConnectorBeacon />
    </div>

    <div>
      <ContractLoader />
    </div>


     
  </div>
  
  <div class="mt-auto">
    <TestGlobal />
  </div>
</main>

<style>


</style>
