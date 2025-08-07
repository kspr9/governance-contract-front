<script lang="ts">
    import BaseForm from './BaseForm.svelte';
    import FormField from './FormField.svelte';
    import { contractInstance } from '../../stores/contractStore.svelte';
    import { resetProvider } from '../../config/beaconConfig';
    import { contractState } from '../../stores/contractStore.svelte';
    import { toastStore } from '../../stores/toastStore.svelte';
    
    interface Props {
        onSuccess?: () => void;
        onCancel?: () => void;
        handleLoadContract: (address: string) => Promise<void>;
        open?: boolean;
    }

    let { onSuccess, onCancel, handleLoadContract, open = $bindable() }: Props = $props();
    
    let formData = $state({
        amount: null as number | null
    });
    
    let loading = $state(false);
    let error = $state<string | null>(null);
    let fieldErrors = $state({
        amount: false
    });
    let attempted = $state(false);
    
    // Clear field errors when user starts typing
    $effect(() => {
        if (formData.amount) {
            fieldErrors.amount = false;
        }
    });
    
    async function handleSubmit(event: Event) {
        event.preventDefault();
        attempted = true;
        
        // Validate fields and highlight errors
        fieldErrors.amount = !formData.amount;
        
        // If any field has errors, don't submit
        if (fieldErrors.amount) {
            return;
        }
        
        // Additional validation for positive number
        if (formData.amount !== null && formData.amount <= 0) {
            fieldErrors.amount = true;
            return;
        }
        
        loading = true;
        error = null;
        
        try {

            await resetProvider();

            const operation = await $contractInstance.methods.mint_shares_to_pool(
                formData.amount
            ).send();

            const result = await operation.confirmation(2);
            console.log("Shares minted successfully", result);
            
            // Reset form
            formData.amount = null;
            fieldErrors.amount = false;
            attempted = false;
            
            await handleLoadContract($contractState.contractAddress || '');
            toastStore.add('success', 'Shares minted successfully', result.hash);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to mint shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to mint shares";
            error = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loading = false;
        }
    }
</script>

<BaseForm
    title="Mint Shares"
    tooltip="Create new shares and add them to the treasury pool"
    bind:open
    onSubmit={handleSubmit}
    {loading}
    {error}
    submitLabel="Mint Shares"
    {onCancel}
    disabled={false}
>
    <FormField
        label="Amount"
        id="mint-amount"
        type="text"
        inputmode="numeric"
        pattern="[0-9]+"
        bind:value={formData.amount}
        placeholder="Enter number of shares to mint"
        required
        error={fieldErrors.amount && attempted ? "Amount is required and must be positive" : null}
        helpText="Number of new shares to mint to the treasury pool"
    />
</BaseForm>