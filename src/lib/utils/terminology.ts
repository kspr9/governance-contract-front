/**
 * Central terminology mapping for business-friendly UI labels
 * Maps technical blockchain/contract terms to user-friendly business language
 */

export const terminology = {
  // Navigation & Main Actions
  DEPLOY_CONTRACT: "Create Digital Share Register",
  VIEW_CONTRACTS: "View Share Registers", 
  LOAD_CONTRACT: "Open Share Register",
  CREATE_SHARE_WALLET: "Deploy New Register",
  MANAGE_DEPLOYED_WALLETS: "Manage Deployed Registers",
  
  // Contract Operations - User Actions
  CLAIM_SHARES: "Claim Allocated Shares",
  CLAIM_SHARES_DIRECT: "Send Allocated Shares",
  TRANSFER_SHARES: "Transfer Shares",
  TRANSFER_HELD_SHARES: "Transfer My Shares",
  
  // Contract Operations - Admin Actions
  MINT_SHARES: "Create Additional Shares",
  ISSUE_SHARES: "Create Additional Shares",
  ALLOCATE_SHARES: "Assign Shares",
  DEALLOCATE_SHARES: "Remove Assigned Shares",
  CHANGE_MAX_SHARES: "Update Maximum Shares",
  CHANGE_ADMIN: "Change Administrator",
  ADD_COMPANY_DATA: "Update Company Information",
  
  // Data Labels
  SHARE_LEDGER: "Shareholders",
  CAP_TABLE: "Ownership Summary",
  WALLET_CONTRACT: "Digital Share Register",
  TREASURY_SHARES: "Unallocated Shares",
  UNCLAIMED_SHARES: "Unallocated Shares",
  ELIGIBLE_CLAIMANTS: "Pending Allocations",
  HELD_SHARES: "My Share Portfolio",
  EXTERNAL_SHARES: "My Share Portfolio",
  ISSUED_SHARES: "Total Issued Shares",
  MAX_SHARES: "Maximum Authorized Shares",
  REGISTRY_NUMBER: "Registry Number",
  ADMIN_ADDRESS: "Administrator",
  CONTRACT_ADDRESS: "Register Address",
  ISSUING_CONTRACT: "Share Register",
  
  // Section Headers
  ADMIN_OPERATIONS: "Company Management",
  USER_OPERATIONS: "Shareholder Actions",
  CONTRACT_DETAILS: "Register Information",
  COMPANY_INFO: "Company Information",
  
  // Form Labels
  OWNER_ADDRESS: "Shareholder Address",
  DESTINATION_ADDRESS: "Recipient Address", 
  AMOUNT: "Number of Shares",
  NEW_ADMIN_ADDRESS: "New Administrator Address",
  
  // Status & Actions
  CONNECT_WALLET: "Connect Wallet",
  DISCONNECT_WALLET: "Disconnect Wallet",
  RELOAD_CONTRACT: "Refresh Register Data",
  VIEW_ON_EXPLORER: "View on Blockchain Explorer",
  TRANSACTION_HASH: "Transaction ID",
  
  // Tabs
  TAB_WALLET: "My Shares",
  TAB_REGISTER: "Share Register", 
  TAB_ADMIN: "Company Management",
  
  // Help Text
  HELP_CLAIM_SHARES: "Claim shares that have been allocated to you by entering the issuing register's address",
  HELP_CLAIM_SHARES_DIRECT: "Send allocated shares to any designated wallet address (admin function)",
  HELP_TRANSFER_SHARES: "Send your shares to another wallet or share register",
  HELP_ISSUE_SHARES: "Create new shares and add them to the unallocated pool",
  HELP_ALLOCATE_SHARES: "Assign unallocated shares to a specific shareholder",
  HELP_MAX_SHARES: "The maximum number of shares this company is authorized to issue",
  HELP_REGISTRY_NUMBER: "Official company registration number from the business registry",
  HELP_SHARE_REGISTER: "Official record of all company shareholders and their ownership",
  
} as const;

// Type for terminology keys
export type TerminologyKey = keyof typeof terminology;

/**
 * Get business-friendly text for a terminology key
 */
export function getLabel(key: TerminologyKey): string {
  return terminology[key];
}

/**
 * Get help text for a concept (if available)
 */
export function getHelpText(key: string): string | undefined {
  const helpKey = `HELP_${key}` as keyof typeof terminology;
  return terminology[helpKey];
}
