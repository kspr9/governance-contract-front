<script lang="ts">
    import { CloudDownload } from 'lucide-svelte';
    
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
            placeholder="Tokenization Registry Address" 
        />
        <button 
            type="submit"
            class="btn-search "
        >
            <span>Load</span>
            <CloudDownload size={24} />
        </button>
    </form>
</div>

<style>
    .btn-search:hover {
        border: 1px solid var(--primary);
        color: var(--primary);
    }
</style> 