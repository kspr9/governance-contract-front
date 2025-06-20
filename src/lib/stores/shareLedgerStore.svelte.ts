interface TzktTicket {
    data: string;
    amount: string;
    address: string;
}

interface ShareLedgerState {
    eligibleClaimants: [string, string][];
    unclaimedSharePool: [string, TzktTicket][];
    heldExternalShares: [string, TzktTicket][];
    shareLedger: [string, string][];
    loading: boolean;
    error: string | null;
}

function createShareLedgerStore() {
    let state = $state<ShareLedgerState>({
        eligibleClaimants: [],
        unclaimedSharePool: [],
        heldExternalShares: [],
        shareLedger: [],
        loading: false,
        error: null,
    });

    function set(data: Partial<Omit<ShareLedgerState, 'loading' | 'error'>>) {
        state.eligibleClaimants = data.eligibleClaimants ?? state.eligibleClaimants;
        state.unclaimedSharePool = data.unclaimedSharePool ?? state.unclaimedSharePool;
        state.heldExternalShares = data.heldExternalShares ?? state.heldExternalShares;
        state.shareLedger = data.shareLedger ?? state.shareLedger;
    }

    function setLoading(loading: boolean) {
        state.loading = loading;
    }

    function setError(error: string | null) {
        state.error = error;
    }

    function reset() {
        state.eligibleClaimants = [];
        state.unclaimedSharePool = [];
        state.heldExternalShares = [];
        state.shareLedger = [];
        state.loading = false;
        state.error = null;
    }
    
    return {
        get state() { return state },
        set,
        setLoading,
        setError,
        reset
    }
}

export const shareLedgerStore = createShareLedgerStore(); 