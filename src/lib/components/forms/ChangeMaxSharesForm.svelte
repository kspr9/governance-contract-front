<script lang="ts">
    import BaseForm from './BaseForm.svelte';
    import FormField from './FormField.svelte';
    import { contractInstance } from '../../stores/contractStore.svelte';
    import { resetProvider } from '../../config/beaconConfig';
    import { loadContractTzkt } from '../../utils/contractLoader';
    import { toastStore } from '../../stores/toastStore.svelte';
    
    interface Props {
        onSuccess?: () => void;
        onCancel?: () => void;
    }

    let { onSuccess, onCancel }: Props = $props();
    
    let formData = $state({
        newMax: null as number | null
    });
    
    let loading = $state(false);
    let error = $state<string | null>(null);
    let success = $state<string | null>(null);
    
    async function handleSubmit(event: Event) {
        event.preventDefault();
        loading = true;
        error = null;
        success = null;
        
        try {
            if (!formData.newMax || formData.newMax <= 0) {
                throw new Error("New maximum must be a positive number");
            }

            await resetProvider();

            const operation = await $contractInstance.methods.change_max_shares(
                formData.newMax
            ).send();

            const result = await operation.confirmation(2);
            console.log("Max shares updated successfully", result);
            
            // Reset form
            formData.newMax = null;
            success = 'Maximum shares updated successfully';
            
            await loadContractTzkt();
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
    onSubmit={handleSubmit}
    {loading}
    {error}
    {success}
    submitLabel="Update Maximum"
    {onCancel}
    disabled={!formData.newMax}
>
    <FormField
        label="New Maximum"
        id="change-max"
        type="number"
        bind:value={formData.newMax}
        placeholder="Enter new maximum number of shares"
        required
        helpText="The new maximum number of shares that can exist for this company"
    />
</BaseForm>