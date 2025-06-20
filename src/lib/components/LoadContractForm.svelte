<script lang="ts">
    let { handleLoadContract }: { handleLoadContract: (address: string) => Promise<void> } = $props();
    let contractInput = $state('');
</script>

<div class="bg-[color:var(--card)] rounded-lg shadow p-4 border border-[color:var(--border)] h-full">
    <div class="font-semibold text-lg mb-2 text-[color:var(--primary)]">Load Company Share Register</div>
    <div class="flex gap-2 mb-2">
        <input 
            class="flex-1 p-2 border rounded bg-[color:var(--background)] text-[color:var(--foreground)]" 
            bind:value={contractInput} 
            placeholder="Contract address" 
        />
        <button 
            class="px-4 py-2 bg-[color:var(--primary)] text-[color:var(--background)] rounded hover:bg-[color:var(--accent)] border border-[color:var(--border)]"
            onclick={() => handleLoadContract(contractInput)}
        >
            Load
        </button>
    </div>
</div> 