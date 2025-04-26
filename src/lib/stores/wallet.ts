
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';


export interface WalletData {
    wallet: BeaconWallet | null;
    Tezos: TezosToolkit | null;
    userAddress: string | null;
    wbalance: string | null;
    walletDataAvailable: boolean;
}


export const walletState = $state<WalletData>({
    wallet: null,
    Tezos: null,
    userAddress: null,
    wbalance: null,
    walletDataAvailable: false
});