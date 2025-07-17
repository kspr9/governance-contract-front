<script lang="ts">
    interface Props {
        label: string;
        id: string;
        type?: 'text' | 'number' | 'email';
        value: string | number | null;
        placeholder?: string;
        required?: boolean;
        error?: string | null;
        disabled?: boolean;
        helpText?: string;
    }

    let { 
        label, 
        id, 
        type = 'text', 
        value = $bindable(), 
        placeholder = '', 
        required = false, 
        error = null, 
        disabled = false,
        helpText = ''
    }: Props = $props();
</script>

<div class="form-field">
    <label for={id} class="form-label">
        {label}
        {#if required}<span class="text-destructive">*</span>{/if}
    </label>
    
    <input
        {id}
        {type}
        {placeholder}
        {required}
        {disabled}
        bind:value
        class="input {error ? 'border-destructive' : ''} {disabled ? 'disabled' : ''}"
    />
    
    {#if helpText}
        <p class="form-help">{helpText}</p>
    {/if}
    
    {#if error}
        <p class="form-error">{error}</p>
    {/if}
</div>

<style>
    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .form-label {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--foreground);
    }
    
    .form-help {
        font-size: 0.75rem;
        color: var(--muted-foreground);
    }
    
    .form-error {
        font-size: 0.75rem;
        color: var(--destructive);
        font-weight: 500;
    }
    
    .input.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>