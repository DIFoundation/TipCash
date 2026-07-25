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

// Send ZEC transaction
export interface SendParams {
  from: string;
  to: string;
  amount: number;
  memo?: string;
}

export async function sendTransaction(params: SendParams) {
  const outputs = [
    {
      address: params.to,
      amount: params.amount,
      memo: params.memo ? Buffer.from(params.memo).toString("base64") : "",
    },
  ];

  return runZingo(params.from, ["z_sendmany", JSON.stringify(outputs), "1"]);
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

export async function validateAddress(userId: string, address: string): Promise<AddressValidation> {
  const output = await runZingo(userId, ["validateaddress", address]);
  return JSON.parse(output as string);
}

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
