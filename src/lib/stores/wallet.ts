
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';


export interface WalletData {
    wallet: TempleWallet | null;
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