<script lang="ts">
    import LoadingDots from '../LoadingDots.svelte';

    interface Props {
        loading?: boolean;
        disabled?: boolean;
        submitLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
        fullWidth?: boolean;
    }

    let { 
        loading = false, 
        disabled = false, 
        submitLabel = 'Submit', 
        cancelLabel = 'Cancel',
        onCancel,
        fullWidth = false
    }: Props = $props();
</script>

<div class="form-actions {fullWidth ? 'full-width' : ''}">
    {#if onCancel}
        <button 
            type="button" 
            class="btn-secondary"
            onclick={onCancel}
            {disabled}
        >
            {cancelLabel}
        </button>
    {/if}
    
    <button 
        type="submit" 
        class="btn-primary {fullWidth ? 'btn-full' : ''}"
        disabled={disabled || loading}
    >
        {#if loading}
            <LoadingDots />
        {:else}
            {submitLabel}
        {/if}
    </button>
</div>

<style>
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        align-items: center;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
    }
    
    .form-actions.full-width {
        justify-content: stretch;
    }
    
    .form-actions.full-width button {
        flex: 1;
    }
</style>