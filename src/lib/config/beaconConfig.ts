import { type AccountInfo, DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { BeaconEvent } from "@airgap/beacon-sdk";
import { walletStore } from '$lib/stores/beaconStore.svelte';


const rpcUrl_teztnets = "https://rpc.ghostnet.teztnets.com";
const rpcUrl_smartpy = "https://ghostnet.smartpy.io";
const rpcUrl_tzkt = "https://rpc.tzkt.io/ghostnet";
const rpcUrl_mainnet = "https://rpc.tzkt.io/mainnet";

const SELECTED_RPC_URL = rpcUrl_mainnet;

let tezosToolkitInstance = new TezosToolkit(SELECTED_RPC_URL);
let beaconWalletInstance = new BeaconWallet({ 
    name: "Tokenshare Beacon Wallet", 
    preferredNetwork: NetworkType.MAINNET 
});


// Export configured instances
export const Tezos = tezosToolkitInstance;
export const wallet = beaconWalletInstance;

// Update wallet store
walletStore.set(beaconWalletInstance);


// Configure Tezos toolkit with wallet
tezosToolkitInstance.setWalletProvider(wallet);

if (wallet) {
    wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
        console.log(
            `${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `,
            account,
            account?.address,
        );

        if (!account) {
            return;
        }

        // // Re-enable the wallet provider just in case
        // Tezos.setWalletProvider(wallet);
    });
}




// const options: DAppClientOptions = {
//     name: 'TokenshareBeaconDApp',
//     iconUrl: 'https://taquito.io/img/favicon.svg',
//     network: { type: NetworkType.GHOSTNET },
//     enableMetrics: true,
// };

// let beaconDAppClientInstance: DAppClient | null = null;


// export function getBeaconDAppClient(): DAppClient {
//     if (beaconDAppClientInstance === null) {
//         beaconDAppClientInstance = new DAppClient(options);
//         console.log("Creating a new DAppClient instance");
//     }
//     return beaconDAppClientInstance;
// }

// export function getTezosToolkit(): TezosToolkit {
//     if (tezosToolkitInstance === null) {
//         tezosToolkitInstance = new TezosToolkit(rpcUrl_teztnets);
//         console.log("Creating a new TezosToolkit instance");
//     }
//     return tezosToolkitInstance;
// }

// export function getBeaconWallet(): BeaconWallet {
//     if (beaconWalletInstance === null) {
//         beaconWalletInstance = new BeaconWallet({ 
//             name: "Tokenshare Beacon Wallet", 
//             preferredNetwork: NetworkType.GHOSTNET });
//         console.log("Creating a new BeaconWallet instance");
//         walletStore.set(beaconWalletInstance);
//     }
//     return beaconWalletInstance;
// }

// Helper functions
export async function getActiveAccount(): Promise<AccountInfo | undefined> {
    try {
        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount) {
            console.log("Active account:", activeAccount.address);
            
            // Important: Ensure wallet provider is set
            Tezos.setWalletProvider(wallet);
            
            return activeAccount;
        }
        return undefined;
    } catch (error) {
        console.error("Error getting active account:", error);
        return undefined;
    }
}

export async function resetProvider() {
    // First disconnect existing provider if any
    Tezos.setProvider({ rpc: SELECTED_RPC_URL });
    // Then set wallet provider again
    Tezos.setWalletProvider(wallet);
}

