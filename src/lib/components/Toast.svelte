<script lang="ts">
    import { toastStore } from '../stores/toastStore.svelte';
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    const getToastClasses = (type: 'success' | 'error' | 'info') => {
        const baseClasses = 'p-4 rounded-lg shadow-lg mb-2 flex items-start justify-between';
        switch (type) {
            case 'success':
                return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
            case 'error':
                return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
            case 'info':
                return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
        }
    };

    // Track the last clicked button position
    let lastClickedButton: HTMLElement | null = null;

    // Subscribe to click events on buttons
    if (typeof window !== 'undefined') {
        window.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON') {
                lastClickedButton = target;
            }
        });
    }
</script>

<div class="fixed z-50 w-96" style="top: {lastClickedButton ? lastClickedButton.getBoundingClientRect().top + window.scrollY + 40 : 16}px; right: 16px;">
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
                class="ml-4 text-gray-500 hover:text-gray-700"
                on:click={() => toastStore.remove(toast.id)}
            >
                ×
            </button>
        </div>
    {/each}
</div> 