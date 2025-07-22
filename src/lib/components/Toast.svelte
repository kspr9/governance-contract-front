<script lang="ts">
    import { toastStore } from '../stores/toastStore.svelte';
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    const getToastClasses = (type: 'success' | 'error' | 'info') => {
        const baseClasses = 'card p-4 flex items-start justify-between';
        switch (type) {
            case 'success':
                return `${baseClasses} border-l-4 border-[color:var(--primary)] bg-[color:var(--card)] text-[color:var(--primary)]`;
            case 'error':
                return `${baseClasses} border-l-4 border-red-500 bg-[color:var(--card)] text-red-400`;
            case 'info':
                return `${baseClasses} border-l-4 border-[color:var(--accent)] bg-[color:var(--card)] text-[color:var(--accent)]`;
        }
    };

</script>

<div class="fixed bottom-4 right-4 z-50 w-96 space-y-2">
    {#each $toastStore as toast (toast.id)}
        <div 
            class={getToastClasses(toast.type)}
            transition:fade={{ duration: 300, easing: cubicOut }}
        >
            <div class="flex-1">
                <p class="font-medium">{toast.message}</p>
                {#if toast.operationHash}
                    <p class="text-sm mt-1 font-mono opacity-75">
                        Hash: {toast.operationHash}
                    </p>
                {/if}
            </div>
            <button 
                class="btn-close ml-4"
                on:click={() => toastStore.remove(toast.id)}
            >
                ×
            </button>
        </div>
    {/each}
</div> 