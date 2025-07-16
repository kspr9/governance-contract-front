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
        maxShares: null as number | null,
        registryNumber: null as number | null
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
            if (!formData.maxShares || formData.maxShares <= 0) {
                throw new Error("Max shares must be a positive number");
            }
            
            if (!formData.registryNumber || formData.registryNumber <= 0) {
                throw new Error("Registry number must be a positive number");
            }

            await resetProvider();

            const operation = await $contractInstance.methodsObject.add_company_data({
                max_shares: formData.maxShares,
                registry_number: formData.registryNumber
            }).send();

            const result = await operation.confirmation(2);
            console.log("Company data added successfully", result);
            
            // Reset form
            formData = { maxShares: null, registryNumber: null };
            success = 'Company data added successfully';
            
            await loadContractTzkt();
            toastStore.add('success', 'Company data added successfully', result.hash);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to add company data:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to add company data";
            error = errorMessage;
            toastStore.add('error', errorMessage);
        } finally {
            loading = false;
        }
    }
</script>

<BaseForm
    title="Add Company Data"
    onSubmit={handleSubmit}
    {loading}
    {error}
    {success}
    submitLabel="Add Company Data"
    {onCancel}
    disabled={!formData.maxShares || !formData.registryNumber}
>
    <FormField
        label="Maximum Shares"
        id="company-max-shares"
        type="number"
        bind:value={formData.maxShares}
        placeholder="Enter maximum number of shares"
        required
        helpText="The maximum number of shares that can be issued for this company"
    />
    
    <FormField
        label="Registry Number"
        id="company-registry"
        type="number"
        bind:value={formData.registryNumber}
        placeholder="Enter Estonian business registry number"
        required
        helpText="The official registry number from the Estonian Business Register"
    />
</BaseForm>