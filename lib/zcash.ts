import { runZingo } from "@/lib/zingo";

export interface ZcashBalance {
  transparent: number;
  private: number;
  total: number;
}

// Get balance for a Zcash address
export async function getBalance(userId: string): Promise<ZcashBalance> {
  const output = await runZingo(userId, ["balance"]);

  // Parse the balance output
  const lines = output.split('\n').filter(line => line.trim());
  const balances: Record<string, number> = {};

  lines.forEach(line => {
    const match = line.match(/(\w+)_balance:\s*(\d+)/);
    if (match) {
      const key = match[1];
      const value = parseInt(match[2], 10);
      balances[key] = value;
    }
  });

  // Calculate totals based on Zcash pool types
  // Transparent: Ironwood + Transparent pools
  const transparent = (balances.total_ironwood_balance || 0) + (balances.total_transparent_balance || 0);
  
  // Private: Orchard + Sapling pools
  const privateBalance = (balances.total_orchard_balance || 0) + (balances.total_sapling_balance || 0);
  
  // Total: all pools combined
  const total = transparent + privateBalance;

  return {
    transparent,
    private: privateBalance,
    total
  };
}

// Legacy single-step send (for backward compatibility)
export async function sendTransaction(userId: string, to: string, amount: number) {
  await runZingo(userId, ["rescan"]);
  const quickSend = await runZingo(userId, ["quicksend", to, amount.toString()]);
  return quickSend;
}

// Get transaction details
export interface TransactionDetail {
  txid: string;
  time: number;
  amount: number;
  address: string;
  category: "send" | "receive";
  confirmations: number;
  memo?: string;
}

export async function getTransaction(userId: string, txid: string) {
  return runZingo(userId, ["gettransaction", txid]);
}

// List recent transactions
export async function listTransactions(userId: string) {
  const output = await runZingo(userId, ["transactions"]);

  return output;
}

// Validate Zcash address
export interface AddressValidation {
  isvalid: boolean;
  address?: string;
  scriptPubKey?: string;
  ismine?: boolean;
  iswatch?: boolean;
  type?: string;
}

// export async function validateAddress(userId: string, address: string): Promise<AddressValidation> {
//   const output = await runZingo(userId, ["validateaddress", address]);
//   return JSON.parse(output as string);
// }

// Get a new address for receiving
export async function getNewAddress(userId: string) {
  const output = await runZingo(userId, ["new_taddress_allow_gap"]);

  // Extract JSON from output (Zingo CLI outputs status messages before JSON)
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Zingo CLI output');
  }

  // Parse the JSON response and extract the encoded address
  const addressData = JSON.parse(jsonMatch[0]);
  return addressData.encoded_address;
}

// Get list of addresses owned by wallet
export async function listAddresses(userId: string) {
  const output = await runZingo(userId, ["addresses"]);

  return JSON.parse(output as string);
}
// Get price conversion (mock)
export async function getZecPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd",
    );

    const data = await response.json();

    return data.zcash.usd;
  } catch (error) {
    console.error("Error fetching ZEC price:", error);
    // Return mock price
    return 50 + Math.random() * 20;
  }
}

// Convert between ZEC and USD
export async function convertZecToUsd(zecAmount: number): Promise<number> {
  const price = await getZecPrice();
  return zecAmount * price;
}

export async function convertUsdToZec(usdAmount: number): Promise<number> {
  const price = await getZecPrice();
  return usdAmount / price;
}

export async function getBlockchainInfo(userId: string) {
  return runZingo(userId, ["getblockchaininfo"]);
}

export async function getBlockCount(userId: string) {
  return runZingo(userId, ["getblockcount"]);
}

export async function getBestBlockHash(userId: string) {
  return runZingo(userId, ["getbestblockhash"]);
}

// Cipherscan Explorer API interfaces
export interface CipherscanTransaction {
  txid: string;
  blockHeight: number;
  blockTime: string;
  size: number;
  txIndex: number;
  hasSapling: boolean;
  hasOrchard: boolean;
  hasIronwood: boolean;
  inputValue: number;
  outputValue: number;
  netChange: number;
  counterparty: string | null;
  senderCount: number;
  recipientCount: number;
}

export interface CipherscanPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CipherscanAddressInfo {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
  transactions: CipherscanTransaction[];
  pagination: CipherscanPagination;
}

// Get address information from Cipherscan explorer API
export async function getExplorerAddress(
  address: string,
  page: number = 1,
  limit: number = 25
): Promise<CipherscanAddressInfo> {
  const url = `https://api.testnet.cipherscan.app/api/address/${address}?page=${page}&limit=${limit}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cipherscan API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Get balance from Cipherscan explorer API
export async function getExplorerBalance(address: string): Promise<number> {
  const data = await getExplorerAddress(address, 1, 1);
  return data.balance;
}

// Get transactions from Cipherscan explorer API
export async function getExplorerTransactions(
  address: string,
  page: number = 1,
  limit: number = 25
): Promise<CipherscanTransaction[]> {
  const data = await getExplorerAddress(address, page, limit);
  return data.transactions;
}

// Get transaction count from Cipherscan explorer API
export async function getExplorerTxCount(address: string): Promise<number> {
  const data = await getExplorerAddress(address, 1, 1);
  return data.txCount;
}
