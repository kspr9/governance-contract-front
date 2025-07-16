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
        amount: null as number | null
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
            if (!formData.amount || formData.amount <= 0) {
                throw new Error("Amount must be a positive number");
            }

            await resetProvider();

            const operation = await $contractInstance.methods.mint_shares_to_pool(
                formData.amount
            ).send();

            const result = await operation.confirmation(2);
            console.log("Shares minted successfully", result);
            
            // Reset form
            formData.amount = null;
            success = 'Shares minted successfully';
            
            await loadContractTzkt();
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
    onSubmit={handleSubmit}
    {loading}
    {error}
    {success}
    submitLabel="Mint Shares"
    {onCancel}
    disabled={!formData.amount}
>
    <FormField
        label="Amount"
        id="mint-amount"
        type="number"
        bind:value={formData.amount}
        placeholder="Enter number of shares to mint"
        required
        helpText="Number of new shares to mint to the treasury pool"
    />
</BaseForm>