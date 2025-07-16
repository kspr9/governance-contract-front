<script lang="ts">
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
            <span class="section-title">{title}</span>
            {#if tooltip}
                <HelpTip text={tooltip} />
            {/if}
        </div>
        <svg 
            class="toggle-icon transition-transform {open ? 'rotate-90' : 'rotate-0'}"
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        >
            <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
    </button>
    
    {#if open}
        <div class="section-content">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .collapsible-section {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius-10);
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
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--primary);
    }
    
    .toggle-icon {
        color: var(--muted-foreground);
        flex-shrink: 0;
    }
    
    .section-content {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid var(--border);
    }
</style>