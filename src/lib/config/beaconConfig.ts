import { type AccountInfo, DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

let tezosToolkitInstance: TezosToolkit | null = null;
let beaconWalletInstance: BeaconWallet | null = null;

const options: DAppClientOptions = {
    name: 'TokenshareBeaconDApp',
    iconUrl: 'https://taquito.io/img/favicon.svg',
    network: { type: NetworkType.GHOSTNET },
    enableMetrics: true,
};

let beaconDAppClientInstance: DAppClient | null = null;

const rpcUrl_teztnets = "https://rpc.ghostnet.teztnets.com";
const rpcUrl_smartpy = "https://ghostnet.smartpy.io";
const rpcUrl_tzkt = " https://rpc.tzkt.io/ghostnet";

export function getBeaconDAppClient(): DAppClient {
    if (beaconDAppClientInstance === null) {
        beaconDAppClientInstance = new DAppClient(options);
        console.log("Creating a new DAppClient instance");
    }
    return beaconDAppClientInstance;
}

export function getTezosToolkit(): TezosToolkit {
    if (tezosToolkitInstance === null) {
        tezosToolkitInstance = new TezosToolkit(rpcUrl_teztnets);
        console.log("Creating a new TezosToolkit instance");
    }
    return tezosToolkitInstance;
}

export function getBeaconWallet(): BeaconWallet {
    if (beaconWalletInstance === null) {
        beaconWalletInstance = new BeaconWallet({ 
            name: "Tokenshare Beacon Wallet", 
            preferredNetwork: NetworkType.GHOSTNET });
        console.log("Creating a new BeaconWallet instance");
    }
    return beaconWalletInstance;
}

export async function getActiveAccount(): Promise<AccountInfo | undefined> {
    const activeAccount = await getBeaconWallet().client.getActiveAccount();
    if (activeAccount) {
        console.log("Active account:", activeAccount.address);
        return activeAccount;
    } else {
        console.error("No active account found");
        return undefined;
    }
}