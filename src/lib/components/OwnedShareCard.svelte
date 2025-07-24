<script lang="ts">
    import { contractState } from '../stores/contractStore.svelte';
    import LoadingDots from './LoadingDots.svelte';
    import type { TzktTicket } from '../types/contract';
    import { transferHeldShares } from '../utils/contractActions';
    import { terminology } from '../utils/terminology';
    import HelpTip from './HelpTip.svelte';
    import { toastStore } from '../stores/toastStore.svelte';

    let { ticket, maxSharesCache, maxSharesLoading, handleLoadContract } = $props<{
        ticket: TzktTicket;
        maxSharesCache: Record<string, { max_shares: number, issued_shares?: number, registry_number?: string }>;
        maxSharesLoading: Record<string, boolean>;
        handleLoadContract: (address: string) => Promise<void>;
    }>();

    // Local state management
    let openTransferCard = $state<boolean>(false);
    let transferForm = $state({
        destination: '',
        amount: ''
    });
    let loadingState = $state(false);
    let errorState = $state<string | null>(null);
    let txHash = $state<string | null>(null);

    async function handleTransfer(event: Event) {
        event.preventDefault();
        const { destination, amount } = transferForm;
        if (!destination || !amount) return;
        
        loadingState = true;
        errorState = null;
        txHash = null;
        
        try {
            const result = await transferHeldShares({
                amount,
                destination,
                share: ticket.address
            });
            
            // Set transaction hash and show success toast
            txHash = result;
            toastStore.add('success', `Successfully transferred ${amount} shares to ${destination}`, result);
            
            // Reset form and close after a delay
            setTimeout(() => {
                transferForm = { destination: '', amount: '' };
                openTransferCard = false;
                handleLoadContract($contractState.contractAddress || '');
            }, 2000); // Reduced to 2 seconds since toast handles the success message
        } catch (err) {
            console.error('Transfer failed:', err);
            errorState = err instanceof Error ? err.message : 'Failed to transfer shares';
        } finally {
            loadingState = false;
        }
    }
</script>

<div class="owned-share-card bg-(--card) rounded-(--radius) shadow-md p-5 flex flex-col gap-3 border border-(--border)">
    <!-- 4-column layout: Registry Number | Share Register | Number of Shares | Transfer Button -->
    <div class="grid gap-4 items-center overflow-hidden card-grid">
        <!-- Column 1: Registry Number -->
        <div class="flex flex-col">
            <span class="text-xs text-(--muted-foreground)">{terminology.REGISTRY_NUMBER}</span>
            <span class="text-base font-semibold text-(--foreground)">{maxSharesCache[ticket.address]?.registry_number || 'Not set'}</span>
        </div>
        
        <!-- Column 2: Share Register -->
        <div class="flex flex-col">
            <div class="text-xs text-(--muted-foreground) font-semibold flex items-center gap-1">
                {terminology.ISSUING_CONTRACT}
                <HelpTip text="The share register where these shares were issued" />
            </div>
            <button 
                class="font-mono text-sm text-(--primary) hover:text-(--accent) hover:underline text-left truncate" 
                title="Load this contract" 
                onclick={() => { 
                    $contractState.contractAddress = ticket.address; 
                    handleLoadContract(ticket.address); 
                }}
            >
                {ticket.address}
            </button>
        </div>
        
        <!-- Column 3: Number of Shares -->
        <div class="flex flex-col">
            <span class="text-xs text-(--muted-foreground)">{terminology.AMOUNT}</span>
            <span class="text-lg font-bold text-(--foreground)">
                <span class="font-bold">{ticket.amount}</span>
                {#if maxSharesLoading[ticket.address]}
                    <span class="text-(--muted-foreground) ml-2">/ ...</span>
                {:else if maxSharesCache[ticket.address]}
                    <span class="text-(--muted-foreground) ml-2">/ {maxSharesCache[ticket.address].issued_shares || maxSharesCache[ticket.address].max_shares}</span>
                {:else}
                    <span class="text-(--muted-foreground) ml-2">/ ?</span>
                {/if}
            </span>
        </div>
        
        <!-- Column 4: Transfer Button -->
        <div class="flex justify-end">
            <button 
                class={(openTransferCard ? 'btn-secondary' : 'btn-primary') + ' flex items-center gap-2'}
                title={terminology.TRANSFER_SHARES}
                onclick={() => { openTransferCard = !openTransferCard; }}
            >
                <span class="text-sm hidden lg:inline">{terminology.TRANSFER_SHARES}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4l4-4m-4 4l4 4"/>
                </svg>
            </button>
        </div>
    </div>

    {#if openTransferCard}
        <form class="mt-2 flex flex-col gap-2" onsubmit={handleTransfer}>
            <input
                class="input"
                placeholder={terminology.DESTINATION_ADDRESS}
                bind:value={transferForm.destination}
                disabled={loadingState}
            />
            <input
                class="input"
                placeholder={terminology.AMOUNT}
                type="number"
                min="1"
                bind:value={transferForm.amount}
                disabled={loadingState}
            />
            

            {#if errorState}
                <div class="bg-(--destructive)/10 p-3 rounded-md flex items-center gap-2">
                    <svg class="w-5 h-5 text-(--destructive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-(--destructive)">{errorState}</span>
                </div>
            {/if}

            <button 
                type="submit" 
                class="btn-primary"
                disabled={loadingState}
            >
                {#if loadingState}
                    Transferring<LoadingDots />
                {:else}
                    Transfer
                {/if}
            </button>
        </form>
    {/if}
</div>

<style>
  /* Easy column width adjustments - modify these values to change column widths */
  .card-grid {
    --col-1-width: 15%;  /* Registry Number */
    --col-2-width: 40%;  /* Share Register */
    --col-3-width: 20%;  /* Number of Shares */
    --col-4-width: 25%;  /* Transfer Button */
    grid-template-columns: var(--col-1-width) var(--col-2-width) var(--col-3-width) var(--col-4-width);
  }
</style> 