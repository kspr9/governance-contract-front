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

    let { onSuccess, onCancel, handleLoadContract, open= $bindable() }: Props = $props();
    
    let formData = $state({
        newMax: null as number | null
    });
    
    let loading = $state(false);
    let error = $state<string | null>(null);
    let fieldErrors = $state({
        newMax: false
    });
    let attempted = $state(false);
    
    // Clear field errors when user starts typing
    $effect(() => {
        if (formData.newMax) {
            fieldErrors.newMax = false;
        }
    });
    
    async function handleSubmit(event: Event) {
        event.preventDefault();
        attempted = true;
        
        // Validate fields and highlight errors
        fieldErrors.newMax = !formData.newMax;
        
        // If any field has errors, don't submit
        if (fieldErrors.newMax) {
            return;
        }
        
        // Additional validation for positive number
        if (formData.newMax !== null && formData.newMax <= 0) {
            fieldErrors.newMax = true;
            return;
        }
        
        loading = true;
        error = null;
        
        try {

            await resetProvider();

            const operation = await $contractInstance.methods.change_max_shares(
                formData.newMax
            ).send();

            const result = await operation.confirmation(2);
            console.log("Max shares updated successfully", result);
            
            // Reset form
            formData.newMax = null;
            fieldErrors.newMax = false;
            attempted = false;
            
            await handleLoadContract($contractState.contractAddress || '');
            toastStore.add('success', 'Maximum shares updated successfully', result.hash);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to change max shares:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to change max shares";
            error = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loading = false;
        }
    }
</script>

<BaseForm
    title="Change Maximum Shares"
    tooltip="Update the maximum number of shares allowed"
    bind:open
    onSubmit={handleSubmit}
    {loading}
    {error}
    submitLabel="Update Maximum"
    {onCancel}
    disabled={false}
>
    <FormField
        label="New Maximum"
        id="change-max"
        type="text"
        inputmode="numeric"
        pattern="[0-9]+"
        bind:value={formData.newMax}
        placeholder="Enter new maximum number of shares"
        required
        error={fieldErrors.newMax && attempted ? "New maximum is required and must be positive" : null}
        helpText="The new maximum number of shares that can exist for this company"
    />
</BaseForm>