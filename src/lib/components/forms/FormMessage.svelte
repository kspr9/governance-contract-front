<script lang="ts">
    interface Props {
        type: 'error' | 'success' | 'warning' | 'info';
        message: string;
        dismissible?: boolean;
        onDismiss?: () => void;
    }

    let { 
        type, 
        message, 
        dismissible = false,
        onDismiss
    }: Props = $props();
</script>

<div class="form-message {type}">
    <div class="message-content">
        <div class="message-icon">
            {#if type === 'error'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            {:else if type === 'success'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
            {:else if type === 'warning'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="m12 17 .01 0"></path>
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="m12 8 .01 0"></path>
                </svg>
            {/if}
        </div>
        
        <p class="message-text">{message}</p>
        
        {#if dismissible && onDismiss}
            <button 
                type="button" 
                class="message-dismiss"
                onclick={onDismiss}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        {/if}
    </div>
</div>

<style>
    .form-message {
        border-radius: var(--radius-10);
        padding: 1rem;
        margin: 1rem 0;
        border: 1px solid;
    }
    
    .message-content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .message-icon {
        flex-shrink: 0;
    }
    
    .message-text {
        flex: 1;
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.4;
    }
    
    .message-dismiss {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .message-dismiss:hover {
        opacity: 1;
    }
    
    /* Error styling */
    .form-message.error {
        background-color: rgba(239, 68, 68, 0.1);
        border-color: var(--destructive);
        color: var(--destructive);
    }
    
    /* Success styling */
    .form-message.success {
        background-color: rgba(16, 185, 129, 0.1);
        border-color: var(--success);
        color: var(--success);
    }
    
    /* Warning styling */
    .form-message.warning {
        background-color: rgba(245, 158, 11, 0.1);
        border-color: var(--warning);
        color: var(--warning);
    }
    
    /* Info styling */
    .form-message.info {
        background-color: rgba(14, 165, 233, 0.1);
        border-color: var(--info);
        color: var(--info);
    }
</style>