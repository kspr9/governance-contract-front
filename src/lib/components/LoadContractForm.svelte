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
            class="search-button"
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
    .search-container {
        display: flex;
        max-width: 800px;
        margin: 0 auto;
        background-color: white;
        border-radius: 50px;
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        padding: 3px;
        gap: 4px;
    }

    .search-input {
        flex-grow: 1;
        border: none;
        outline: none;
        padding: 10px 16px;
        font-size: 1rem;
        color: #333;
        background: transparent;
    }

    .search-input::placeholder {
        color: #999;
    }

    .search-button {
        display: flex;
        align-items: center;
        gap: 8px;
        border: none;
        background-color: #0b72e5;
        color: white;
        padding: 4px 20px;
        font-family: 'Euclid Circular A', sans-serif;
        font-weight: 300;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        min-width: fit-content;
        border-radius: 50px;
    }

    .search-button:hover {
        background-color: #0a61c4;
    }

    .search-button svg {
        stroke: white;
    }
</style> 