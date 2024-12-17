<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import TestGlobal from './lib/TestGlobal.svelte'
  import Taq from './lib/Taq.svelte'
</script>

<main class="min-h-screen bg-gray-400 p-4 flex flex-col">
  <div class="flex-grow-0">
    <h1 class="text-3xl font-bold text-blue-600">Vite + Svelte</h1>

    <div class="card">
      <Counter />
    </div>

    <div class="card">
      <Taq />
    </div>
  </div>
  
  <div class="mt-auto">
    <TestGlobal />
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }

</style>
