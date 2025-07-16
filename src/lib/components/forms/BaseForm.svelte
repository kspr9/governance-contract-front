<script lang="ts">
    import FormActions from './FormActions.svelte';
    import FormMessage from './FormMessage.svelte';
    
    interface Props {
        title: string;
        onSubmit: (event: Event) => void | Promise<void>;
        loading?: boolean;
        error?: string | null;
        success?: string | null;
        submitLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
        fullWidth?: boolean;
        disabled?: boolean;
        children: import('svelte').Snippet;
    }

    let { 
        title,
        onSubmit,
        loading = false,
        error = null,
        success = null,
        submitLabel = 'Submit',
        cancelLabel = 'Cancel',
        onCancel,
        fullWidth = false,
        disabled = false,
        children
    }: Props = $props();
</script>

<div class="base-form">
    <h3 class="form-title">{title}</h3>
    
    <form onsubmit={onSubmit}>
        {#if error}
            <FormMessage type="error" message={error} />
        {/if}
        
        {#if success}
            <FormMessage type="success" message={success} />
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
        />
    </form>
</div>

<style>
    .base-form {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius-10);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
    }
    
    .form-title {
        color: var(--foreground);
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 1.5rem 0;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
    }
    
    .form-content {
        margin-bottom: 1rem;
    }
</style>