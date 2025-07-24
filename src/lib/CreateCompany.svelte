<script lang="ts">
    import { Tezos, resetProvider, wallet } from './config/beaconConfig';
    import { beaconState } from './stores/beaconStore.svelte';
    import { contractInstance, contractState } from './stores/contractStore.svelte';
    import { governanceStorageData } from './stores/governanceStorage.svelte';
    import { loadGovernanceContractTzkt } from './utils/governanceLoader';
    import { loadContractTzkt } from './utils/contractLoader';
    import { onMount } from 'svelte';
    import { terminology } from './utils/terminology';
    import HelpTip from './components/HelpTip.svelte';

    // Accept the callback function as a prop
    interface Props {
        onViewContract: (contractAddress: string) => void;
    }
    
    let { onViewContract }: Props = $props();

    let adminAddress: string = $state("");
    let maxShares: string = $state("");
    let registryNumber: string = $state("");

    // States for handling the transaction
    let isLoading = $state(false);
    let txHash = $state("");
    let errorMsg = $state("");

    // The target contract address that holds the create_company entrypoint
    const governanceContractAddress: string = "KT1DoyveycFuAXcNwRvGJy4VGGsSiskdCcU1";

    // test-governance on mainnet
    //const governanceContractAddress: string = "KT1A68pp2xWMSbyvVmC63oJreW6RAfotCVNE";

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
            const op = await governanceContract.methodsObject.create_company_wallet({
                companyID: registryNumberNat,
                shares: maxSharesNat,
                admin: adminAddress
            }).send();

            // Wait for confirmation
            await op.confirmation(2);
            txHash = op.opHash;
            // Reload governance contract storage after successful creation
            await loadGovernanceContractTzkt(governanceContractAddress);
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

    function handleViewContract(contractAddress: string) {
        // Call the parent function to switch views and set the contract address
        onViewContract(contractAddress);
    }

    // Load governance contract storage on mount
    onMount(() => {
        loadGovernanceContractTzkt(governanceContractAddress);
    });

</script>
<div class="container mx-auto p-4">
    
    <form onsubmit={handleCreateCompany} class="space-y-4 p-4 border rounded card">
      <h2 class="section-header">{terminology.CREATE_SHARE_WALLET}
        <HelpTip text="Create a new digital share register for a company" />
      </h2>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-(--muted-foreground)">{terminology.ADMIN_ADDRESS}</label>
        <input
          type="text"
          bind:value={adminAddress}
          placeholder="Admin Address"
          class="input mt-1 block w-full"
          required
        />
      </div>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-(--muted-foreground)">{terminology.MAX_SHARES}</label>
        <input
          type="number"
          bind:value={maxShares}
          placeholder="Maximum Shares"
          class="input mt-1 block w-full"
          required
        />
      </div>
    
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-(--muted-foreground)">{terminology.REGISTRY_NUMBER}</label>
        <input
          type="number"
          bind:value={registryNumber}
          placeholder="Registry Number"
          class="input mt-1 block w-full"
          required
        />
      </div>
    
      <button type="submit" class="btn-primary" disabled={isLoading}>
        {#if isLoading}
          Sending...
        {:else}
          Deploy new Company Share Register
        {/if}
      </button>
    
      {#if txHash}
        <p class="text-(--primary)">Transaction sent! Hash: {txHash}</p>
      {/if}
    
      {#if errorMsg}
        <p class="text-(--destructive)">{errorMsg}</p>
      {/if}
    </form>

    <!-- Deployed Wallet Contracts Table -->
    <div class="mt-8 card">
      <div class="section-header mb-2">Deployed Share Registers</div>
      <div class="text-sm text-(--muted-foreground) mb-4">View all wallet contracts that have been deployed from the governance contract.</div>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="table-header">
            <th class="text-left p-2">Registry Number</th>
            <th class="text-left p-2">Contract Address</th>
            <th class="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if governanceStorageData.deployedContracts && Object.keys(governanceStorageData.deployedContracts).length > 0}
            {#each Object.entries(governanceStorageData.deployedContracts) as [registry, address]}
              <tr class="table-row">
                <td class="p-2">{registry}</td>
                <td class="font-mono p-2">{address}</td>
                <td class="p-2">
                  <button 
                    class="btn-secondary px-3 py-1 text-xs"
                    onclick={() => handleViewContract(address)}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          {:else}
            <tr class="table-row">
              <td class="text-center p-2 text-(--muted-foreground)" colspan="3">No deployed contracts found</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
</div>

<style>
  form {
    max-width: 500px;
    margin: 0 auto;
  }
</style> 