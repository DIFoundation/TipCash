import { runZingo } from "@/lib/zingo";

interface RpcResponse<T> {
  result: T;
  error: { code: number; message: string } | null;
  id: number | string;
}

// export async function runZingo<T>(
//   method: string,
//   params: unknown[] = []
// ): Promise<T> {
//   const provider = process.env.ZCASH_PROVIDER ?? "zallet";

//   let url: string;
//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//   };

//   if (provider === "tatum") {
//     url = process.env.TATUM_RPC_URL!;

//     headers["x-api-key"] = process.env.TATUM_API_KEY!;
//   } else {
//     url = process.env.ZCASH_RPC_URL!;

//     headers["Authorization"] =
//       "Basic " +
//       Buffer.from(
//         `${process.env.ZCASH_RPC_USER}:${process.env.ZCASH_RPC_PASSWORD}`
//       ).toString("base64");
//   }

//   const response = await fetch(url, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       id: 1,
//       method,
//       params,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`RPC ${response.status}`);
//   }

//   const json: RpcResponse<T> = await response.json();

//   if (json.error) {
//     throw new Error(json.error.message);
//   }

//   return json.result;
// }

export interface ZcashBalance {
  transparent: number;
  private: number;
  total: number;
}

// Get balance for a Zcash address
export async function getBalance() {
  const output = await runZingo("balance");

  return output;
}

// Get wallet balance (all addresses)
// export async function getWalletBalance(): Promise<ZcashBalance> {
//   const total = await getBalance();

//   return {
//     transparent: total,
//     private: 0,
//     total,
//   };
// }

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

  return runZingo("z_sendmany", params.from, JSON.stringify(outputs), "1");
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

export async function getTransaction(txid: string) {
  return runZingo("gettransaction", txid);
}

// List recent transactions
export async function listTransactions() {
  const output = await runZingo("transactions");

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

export async function validateAddress(address: string) {
  return runZingo("validateaddress", address);
}

// Get a new address for receiving
export async function getNewAddress() {
  const output = await runZingo("new_address", "oz");

  return output;
}

// Get list of addresses owned by wallet
export async function listAddresses() {
  const output = await runZingo("addresses");

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

export async function getBlockchainInfo() {
  return runZingo("getblockchaininfo");
}

export async function getBlockCount() {
  return runZingo("getblockcount");
}

export async function getBestBlockHash() {
  return runZingo("getbestblockhash");
}
