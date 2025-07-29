<script lang="ts">
    import { Search } from 'lucide-svelte';
    
    let { handleLoadContract }: { handleLoadContract: (address: string) => Promise<void> } = $props();
    let contractInput = $state('');

    function handleSubmit(event: Event) {
        event.preventDefault();
        handleLoadContract(contractInput);
    }
</script>

<div class="w-full">
    <form class="search-container" onsubmit={handleSubmit}>
        <input 
            type="text"
            class="search-input" 
            bind:value={contractInput} 
            placeholder="Tokenized Company Contract Address" 
        />
        <button 
            type="submit"
            class="btn-search"
        >
            <Search size={24} />
        </button>
    </form>
</div>

<style>
    .btn-search:hover {
        background-color: var(--dark-bg-text-light) !important;
        border: 2px solid var(--accent-hover) !important;
       
    }

</style> 