import { DAppClient, type DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';

let beaconClientInstance: DAppClient | null = null;
let tezosToolkitInstance: TezosToolkit | null = null;

const options: DAppClientOptions = {
    name: 'TokenshareBeaconDApp',
    iconUrl: 'https://taquito.io/img/favicon.svg',
    network: { type: NetworkType.GHOSTNET },
    enableMetrics: true,
};

const rpcUrl_teztnets = "https://rpc.ghostnet.teztnets.com";
const rpcUrl_smartpy = "https://ghostnet.smartpy.io";
const rpcUrl_tzkt = " https://rpc.tzkt.io/ghostnet";

export function getBeaconClient(): DAppClient {
    if (!beaconClientInstance) {
        beaconClientInstance = new DAppClient(options);
        console.log("Creating a new DAppClient instance");
    }
    return beaconClientInstance;
}

export function getTezosToolkit(): TezosToolkit {
    if (!tezosToolkitInstance) {
        tezosToolkitInstance = new TezosToolkit(rpcUrl_teztnets);
        console.log("Creating a new TezosToolkit instance");
    }
    return tezosToolkitInstance;
}