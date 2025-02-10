<script lang="ts">
    import { Tezos, resetProvider, wallet } from './config/beaconConfig';
    import { beaconState } from './stores/beaconStore.svelte';
    import { contractInstance, contractState } from './stores/contractStore.svelte';

    let adminAddress: string = "";
    let maxShares: string = "";
    let registryNumber: string = "";

    // States for handling the transaction
    let isLoading = false;
    let txHash = "";
    let errorMsg = "";

    // The target contract address that holds the create_company entrypoint
    const governanceContractAddress: string = "KT1RceKkBayRFiFHGjTKumVR6weePNfWbZ3s";

    async function handleCreateCompany(event: Event) {
        event.preventDefault();
        isLoading = true;
        errorMsg = "";
        txHash = "";
        try {
            // Ensure all fields are provided
            if (!adminAddress || !maxShares || !registryNumber) {
                throw new Error("Please fill in all fields");
            }
            
            // Convert maxShares and registryNumber to nat (using parseInt)
            const maxSharesNat = parseInt(maxShares);
            const registryNumberNat = parseInt(registryNumber);
            
            if (isNaN(maxSharesNat) || isNaN(registryNumberNat)) {
                throw new Error("Max Shares and Registry Number must be valid numbers");
            }
            
            // Instead of using $contractInstance (which is for the current contract in view),
            // we instantiate a new contract instance for the governance contract.
            const governanceContract = await Tezos.wallet.at(governanceContractAddress);
            
            await resetProvider();
            // Call the create_company entrypoint
            // Using methodsObject to call the entrypoint by name with the proper parameters.
            const op = await governanceContract.methodsObject.default({
                companyID: registryNumberNat,
                shares: maxSharesNat,
                admin: adminAddress
            }).send();

            // Wait for confirmation
            await op.confirmation(2);
            txHash = op.opHash;
        } catch (error: any) {
            console.error("Error creating company:", error);
            errorMsg = error.message;
        } finally {
            isLoading = false;
        }
    }


  async function connectContract() {
        try {
            // First ensure provider is properly configured
            await resetProvider();
            
            console.log("Wallet ready for contract:", wallet?.getPKH());
        
            // if (!$contractState.contractAddress) {
            //     throw new Error("Contract address not set");
            // }
            // if (!beaconState.isConnected) {
            //     throw new Error("Wallet not connected");
            // }

            // Get the contract instance
            const contract = await Tezos.wallet.at(governanceContractAddress);
            console.log("Contract connected successfully", contract);
            contractInstance.set(contract);

            
        } catch (error) {
            console.error("Failed to load contract:", error);
            throw error;
        }
    }

</script>
<div class="container mx-auto p-4">
    
    <form onsubmit={handleCreateCompany} class="space-y-4 p-4 border rounded">
      <h2 class="text-2xl font-bold">Create a Company</h2>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-gray-700">Company Admin Address</label>
        <input
          type="text"
          bind:value={adminAddress}
          placeholder="Admin Address"
          class="mt-1 block w-full p-2 border rounded"
          required
        />
      </div>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-gray-700">Max Shares</label>
        <input
          type="number"
          bind:value={maxShares}
          placeholder="Maximum Shares"
          class="mt-1 block w-full p-2 border rounded"
          required
        />
      </div>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-gray-700">Registry Number</label>
        <input
          type="number"
          bind:value={registryNumber}
          placeholder="Registry Number"
          class="mt-1 block w-full p-2 border rounded"
          required
        />
      </div>
    
      <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" disabled={isLoading}>
        {#if isLoading}
          Sending...
        {:else}
          Create a Company
        {/if}
      </button>
    
      {#if txHash}
        <p class="text-green-600">Transaction sent! Hash: {txHash}</p>
      {/if}
    
      {#if errorMsg}
        <p class="text-red-600">{errorMsg}</p>
      {/if}
    </form>
</div>

<style>
  form {
    max-width: 500px;
    margin: 0 auto;
  }
</style> 