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
        newAdminAddress: ''
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
            if (!formData.newAdminAddress.trim()) {
                throw new Error("New admin address is required");
            }

            await resetProvider();

            const operation = await $contractInstance.methods.change_admin(
                formData.newAdminAddress
            ).send();

            const result = await operation.confirmation(2);
            console.log("Admin changed successfully", result);
            
            // Reset form
            formData.newAdminAddress = '';
            success = 'Admin changed successfully';
            
            await loadContractTzkt();
            toastStore.add('success', 'Admin changed successfully', result.hash);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to change admin:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to change admin";
            error = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loading = false;
        }
    }
</script>

<BaseForm
    title="Change Admin"
    onSubmit={handleSubmit}
    {loading}
    {error}
    {success}
    submitLabel="Change Admin"
    {onCancel}
    disabled={!formData.newAdminAddress.trim()}
>
    <FormField
        label="New Admin Address"
        id="change-admin"
        type="text"
        bind:value={formData.newAdminAddress}
        placeholder="Enter new admin wallet address"
        required
        helpText="The Tezos address that will become the new contract administrator"
    />
</BaseForm>