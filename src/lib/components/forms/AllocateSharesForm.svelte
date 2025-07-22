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
        amount: '',
        ownerAddress: ''
    });
    
    let loading = $state(false);
    let error = $state<string | null>(null);
    let fieldErrors = $state({
        amount: false,
        ownerAddress: false
    });
    let attempted = $state(false);
    
    // Clear field errors when user starts typing
    $effect(() => {
        if (formData.amount) {
            fieldErrors.amount = false;
        }
    });
    
    $effect(() => {
        if (formData.ownerAddress && formData.ownerAddress.trim()) {
            fieldErrors.ownerAddress = false;
        }
    });

    
    async function handleSubmit(event: Event) {
        event.preventDefault();
        attempted = true;
        
        // Validate fields and highlight errors
        fieldErrors.amount = !formData.amount;
        fieldErrors.ownerAddress = !formData.ownerAddress || !formData.ownerAddress.trim();
        
        // If any field has errors, don't submit
        if (fieldErrors.amount || fieldErrors.ownerAddress) {
            return;
        }
        
        loading = true;
        error = null;
        
        try {
            // Validate amount is a number
            const amount = Number(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                fieldErrors.amount = true;
                throw new Error("Amount must be a valid positive number");
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
            fieldErrors = { amount: false, ownerAddress: false };
            attempted = false;
            
            await handleLoadContract($contractState.contractAddress || '');
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
    tooltip="Allocate shares from treasury to specific addresses"
    bind:open
    onSubmit={handleSubmit}
    {loading}
    {error}
    submitLabel="Allocate Shares"
    {onCancel}
    disabled={false}
>
    <FormField
        label="Amount"
        id="allocate-amount"
        type="number"
        bind:value={formData.amount}
        placeholder="Enter number of shares to allocate"
        required
        error={fieldErrors.amount && attempted ? "Amount is required" : null}
        helpText="Number of shares to allocate to the specified owner"
    />
    
    <FormField
        label="Owner Address"
        id="allocate-owner"
        type="text"
        bind:value={formData.ownerAddress}
        placeholder="Enter owner Registry address"
        required
        error={fieldErrors.ownerAddress && attempted ? "Owner address is required" : null}
        helpText="The Registry address that will receive the allocated shares"
    />
</BaseForm>