import { BeaconEvent, DAppClient, NetworkType } from "@airgap/beacon-sdk";

class BeaconWalletManager {
    private dAppClient: DAppClient;

    constructor() {
        this.dAppClient = new DAppClient({
            name: "TokenShareBeacon",
            preferredNetwork: NetworkType.GHOSTNET
        });

        // Set up default event listeners
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.dAppClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
        });
    }

    async checkActiveAccount() {
        try {
            const activeAccount = await this.dAppClient.getActiveAccount();
            if (activeAccount) {
                console.log("Already connected:", activeAccount.address);
                return activeAccount;
            }
            return null;
        } catch (error) {
            console.error("Error checking active account:", error);
            return null;
        }
    }

    async requestPermissions() {
        try {
            const permissions = await this.dAppClient.requestPermissions({});
            console.log("Got permissions:", permissions.address);
            return permissions;
        } catch (error) {
            console.error("Error requesting permissions:", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.dAppClient.disconnect();
            console.log("Disconnected");
        } catch (error) {
            console.error("Error disconnecting:", error);
            throw error;
        }
    }

    async clearActiveAccount() {
        try {
            await this.dAppClient.clearActiveAccount();
            const account = await this.dAppClient.getActiveAccount();
            console.log("Active Account after clear:", account);
            return account;
        } catch (error) {
            console.error("Error clearing active account:", error);
            throw error;
        }
    }
}

// Create and export a single instance
export const beaconWallet = new BeaconWalletManager();