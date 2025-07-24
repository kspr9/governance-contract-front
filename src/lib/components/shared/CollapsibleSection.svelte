<script lang="ts">
    import { slide } from 'svelte/transition';
    import { ChevronDown } from 'lucide-svelte';
    import HelpTip from '../HelpTip.svelte';

    interface Props {
        title: string;
        open?: boolean;
        onToggle?: (isOpen: boolean) => void;
        tooltip?: string;
        children: import('svelte').Snippet;
    }

    let { title, open = $bindable(true), onToggle, tooltip, children }: Props = $props();
    
    function toggleOpen() {
        open = !open; // Update the bindable prop directly
        if (onToggle) {
            onToggle(open);
        }
    }
</script>

<div class="collapsible-section">
    <button 
        type="button" 
        class="btn-collapse" 
        onclick={toggleOpen}
    >
        <div class="section-title-with-tooltip">
            <span class="text-heading-md">{title}</span>
            {#if tooltip}
                <HelpTip text={tooltip} />
            {/if}
        </div>
        <div class="chevron-container">
            <ChevronDown 
                class="toggle-icon" 
                size={16} 
                style="transform: rotate({open ? '180deg' : '0deg'}); transition: transform 250ms ease-out;"
            />
        </div>
    </button>
    
    {#if open}
        <div class="section-content" transition:slide={{ duration: 250 }}>
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .collapsible-section {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        margin-bottom: 1rem;
    }
    
    
    .section-title-with-tooltip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-align: left;
    }
    
    .section-title {
        @apply text-heading-md;
    }
    
    .chevron-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--muted);
        border-radius: var(--radius-sm);
        flex-shrink: 0;
        transition: background-color var(--transition-fast);
    }
    
    .chevron-container:hover {
        background: var(--secondary-hover);
    }
    
    .toggle-icon {
        color: var(--muted-foreground);
        flex-shrink: 0;
    }
    
    .section-content {
        padding: 1rem 1.5rem 1.5rem;
        border-top: 1px solid var(--border);
    }
</style>