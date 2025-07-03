<script lang="ts">
    import { contractState } from '../stores/contractStore.svelte';
    import LoadingDots from './LoadingDots.svelte';
    import type { TzktTicket } from '../types/contract';
    import { transferHeldShares } from '../utils/contractActions';
    import { terminology } from '../utils/terminology';
    import HelpTip from './HelpTip.svelte';

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
    let successMessage = $state<string | null>(null);
    let showSuccessMessage = $state(false);

    async function handleTransfer(event: Event) {
        event.preventDefault();
        const { destination, amount } = transferForm;
        if (!destination || !amount) return;
        
        loadingState = true;
        errorState = null;
        txHash = null;
        successMessage = null;
        showSuccessMessage = false;
        
        try {
            const result = await transferHeldShares({
                amount,
                destination,
                share: ticket.address
            });
            
            // Set transaction hash and success message
            txHash = result;
            successMessage = `Successfully transferred ${amount} shares to ${destination}`;
            showSuccessMessage = true;
            
            // Reset form and close after a delay
            setTimeout(() => {
                transferForm = { destination: '', amount: '' };
                openTransferCard = false;
                handleLoadContract($contractState.contractAddress || '');
            }, 5000); // Increased to 5 seconds to give more time to read
        } catch (err) {
            console.error('Transfer failed:', err);
            errorState = err instanceof Error ? err.message : 'Failed to transfer shares';
        } finally {
            loadingState = false;
        }
    }
</script>

<div class="bg-[color:var(--card)] rounded-[var(--radius)] shadow-md p-5 flex flex-col gap-3 border border-[color:var(--border)]">
    <div class="grid grid-cols-2 gap-4 mt-2">
        <div class="flex flex-col items-stretch">
            <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.REGISTRY_NUMBER}</span>
            <span class="text-base font-semibold text-[color:var(--foreground)]">{maxSharesCache[ticket.address]?.registry_number || 'Not set'}</span>
        </div>
        <div class="flex flex-col items-center">
            <span class="text-xs text-[color:var(--muted-foreground)]">{terminology.AMOUNT}</span>
            <span class="text-lg font-bold text-[color:var(--primary)]">
                {ticket.amount}
                {#if maxSharesLoading[ticket.address]}
                    <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ ...</span>
                {:else if maxSharesCache[ticket.address]}
                    <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ {maxSharesCache[ticket.address].issued_shares || maxSharesCache[ticket.address].max_shares}</span>
                {:else}
                    <span class="text-xs text-[color:var(--muted-foreground)] ml-2">/ ?</span>
                {/if}
            </span>
        </div>
    </div>
    <div class="flex items-start justify-between">
        <div>
            <div class="text-xs text-[color:var(--muted-foreground)] font-semibold flex items-center">
                {terminology.ISSUING_CONTRACT}
                <HelpTip text="The share register where these shares were issued" />
            </div>
            <button 
                class="font-mono text-sm break-all text-[color:var(--primary)] hover:text-[color:var(--accent)] hover:underline" 
                title="Load this contract" 
                onclick={() => { 
                    $contractState.contractAddress = ticket.address; 
                    handleLoadContract(ticket.address); 
                }}
            >
                {ticket.address}
            </button>
        </div>
        <button 
            class="btn-secondary p-2 flex items-center gap-1 mt-1" 
            title="Transfer" 
            onclick={() => { openTransferCard = !openTransferCard; }}
        >
            <svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
            <span class="text-xs">{terminology.TRANSFER_SHARES}</span>
        </button>
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
            
            {#if showSuccessMessage && successMessage}
                <div class="bg-[color:var(--primary)]/10 p-3 rounded-md space-y-2">
                    <div class="text-[color:var(--primary)] flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                    {#if txHash}
                        <a 
                            href={`https://tzkt.io/${txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-xs text-[color:var(--primary)] hover:underline block"
                        >
                            View transaction on TzKT
                        </a>
                    {/if}
                    <div class="text-xs text-[color:var(--muted-foreground)]">
                        This form will close in a few seconds...
                    </div>
                </div>
            {/if}

            {#if errorState}
                <div class="bg-[color:var(--destructive)]/10 p-3 rounded-md flex items-center gap-2">
                    <svg class="w-5 h-5 text-[color:var(--destructive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-[color:var(--destructive)]">{errorState}</span>
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