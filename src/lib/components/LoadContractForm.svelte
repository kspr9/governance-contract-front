<script lang="ts">
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
            <span>Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        </button>
    </form>
</div>

<style>
    .btn-search svg {
        stroke: white;
    }
</style> 