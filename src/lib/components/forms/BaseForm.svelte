<script lang="ts">
    import FormActions from './FormActions.svelte';
    import FormMessage from './FormMessage.svelte';
    import HelpTip from '../HelpTip.svelte';
    
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
        background: var(--muted);
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
    
    .toggle-icon {
        color: var(--muted-foreground);
        flex-shrink: 0;
    }
    
    .form-content-container {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid var(--border);
    }
    
    .form-content {
        margin-bottom: 1rem;
    }
</style>