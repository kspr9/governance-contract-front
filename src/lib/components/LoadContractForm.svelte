<script lang="ts">
    let { handleLoadContract }: { handleLoadContract: (address: string) => Promise<void> } = $props();
    let contractInput = $state('');
</script>

<div class="bg-[color:var(--card)] rounded-[var(--radius)] shadow p-4 border border-[color:var(--border)] h-full">
    <div class="font-semibold text-lg mb-2 text-[color:var(--primary)]">Load Company Share Register</div>
    <div class="flex gap-2 mb-2">
        <input 
            class="input flex-1" 
            bind:value={contractInput} 
            placeholder="Contract address" 
        />
        <button 
            class="btn-primary"
            onclick={() => handleLoadContract(contractInput)}
        >
            Load
        </button>
    </div>
</div> 