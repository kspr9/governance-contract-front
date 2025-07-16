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
        amount: '',
        ownerAddress: ''
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
            // Validate amount is a number
            const amount = Number(formData.amount);
            if (isNaN(amount)) {
                throw new Error("Amount must be a valid number");
            }
            
            if (!formData.ownerAddress.trim()) {
                throw new Error("Owner address is required");
            }

            await resetProvider();
  
            const operation = await $contractInstance.methodsObject.allocate_shares_to_claimants({
                amount: amount,
                owner_address: formData.ownerAddress
            }).send();

            await operation.confirmation(2);
            console.log("Shares allocated successfully");
            
            // Reset form
            formData = { amount: '', ownerAddress: '' };
            success = 'Shares allocated successfully';
            
            await loadContractTzkt();
            toastStore.add('success', 'Shares allocated successfully');
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to allocate shares:", error);
            error = error instanceof Error ? error.message : "Failed to allocate shares";
        } finally {
            loading = false;
        }
    }
</script>

<BaseForm
    title="Allocate Shares"
    onSubmit={handleSubmit}
    {loading}
    {error}
    {success}
    submitLabel="Allocate Shares"
    {onCancel}
    disabled={!formData.amount || !formData.ownerAddress}
>
    <FormField
        label="Amount"
        id="allocate-amount"
        type="number"
        bind:value={formData.amount}
        placeholder="Enter number of shares to allocate"
        required
        helpText="Number of shares to allocate to the specified owner"
    />
    
    <FormField
        label="Owner Address"
        id="allocate-owner"
        type="text"
        bind:value={formData.ownerAddress}
        placeholder="Enter owner wallet address"
        required
        helpText="The Tezos address that will receive the allocated shares"
    />
</BaseForm>