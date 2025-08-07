<script lang="ts">
    import FormActions from './FormActions.svelte';
    import FormMessage from './FormMessage.svelte';
    import HelpTip from '../HelpTip.svelte';
    import { ChevronDown } from 'lucide-svelte';
    
    interface Props {
        title: string;
        onSubmit: (event: Event) => void | Promise<void>;
        loading?: boolean;
        error?: string | null;
        submitLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
        fullWidth?: boolean;
        disabled?: boolean;
        open?: boolean;
        tooltip?: string;
        onToggle?: (isOpen: boolean) => void;
        children: import('svelte').Snippet;
    }

    let { 
        title,
        onSubmit,
        loading = false,
        error = null,
        submitLabel = 'Submit',
        cancelLabel = 'Cancel',
        onCancel,
        fullWidth = false,
        disabled = false,
        open = $bindable(true),
        tooltip,
        onToggle,
        children
    }: Props = $props();
    
    function toggleOpen() {
        open = !open;
        if (onToggle) {
            onToggle(open);
        }
    }
</script>

<div class="base-form">
    <button 
        type="button" 
        class="form-header" 
        onclick={toggleOpen}
    >
        <div class="form-title-with-tooltip">
            <span class="form-title">{title}</span>
            {#if tooltip}
                <HelpTip text={tooltip} />
            {/if}
        </div>
        <div class="chevron-container">
            <ChevronDown class="w-5 h-5 toggle-icon chevron-rotate {open ? 'chevron-open' : ''}" />
        </div>
    </button>
    
    {#if open}
        <div class="form-content-container">
            <form onsubmit={onSubmit}>
                {#if error}
                    <FormMessage type="error" message={error} />
                {/if}
                
                <div class="form-content">
                    {@render children()}
                </div>
                
                <FormActions 
                    {loading}
                    {disabled}
                    {submitLabel}
                    {cancelLabel}
                    {onCancel}
                    {fullWidth}
                    {onSubmit}
                />
            </form>
        </div>
    {/if}
</div>

<style>
    .base-form {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius-10);
        box-shadow: var(--shadow-sm);
        margin-bottom: 1rem;
    }
    
    .form-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
    }
    
    .form-header:hover {
        /* Remove background color change on hover */
    }
    
    .form-header:focus {
        outline: none;
    }
    
    .form-title-with-tooltip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .form-title {
        @apply: text-heading-md;
        color: var(--muted-foreground);
        font-weight: 600;
        margin: 0;
    }
    
    .chevron-container {
        background: var(--muted);
        border-radius: 6px;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .toggle-icon {
        color: var(--muted-foreground);
        flex-shrink: 0;
        width: 20px;
        height: 20px;
    }
    
    /* Use :global() to ensure Svelte doesn't scope this away */
    :global(.chevron-rotate) {
        transition: transform var(--transition-fast);
    }
    
    /* Rotate chevron when form is open */
    :global(.chevron-open) {
        transform: rotate(180deg);
    }
    
    .form-content-container {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid var(--border);
    }
    
    .form-content {
        margin-bottom: 1rem;
    }
</style>