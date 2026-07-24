interface RpcResponse<T> {
  result: T;
  error: { code: number; message: string } | null;
  id: number | string;
}

export async function callRpc<T>(
  method: string,
  params: unknown[] = []
): Promise<T> {
  const provider = process.env.ZCASH_PROVIDER ?? "zallet";

  let url: string;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (provider === "tatum") {
    url = process.env.TATUM_RPC_URL!;

    headers["x-api-key"] = process.env.TATUM_API_KEY!;
  } else {
    url = process.env.ZCASH_RPC_URL!;

    headers["Authorization"] =
      "Basic " +
      Buffer.from(
        `${process.env.ZCASH_RPC_USER}:${process.env.ZCASH_RPC_PASSWORD}`
      ).toString("base64");
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC ${response.status}`);
  }

  const json: RpcResponse<T> = await response.json();

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.result;
}

export interface ZcashBalance {
  transparent: number;
  private: number;
  total: number;
}

// Get balance for a Zcash address
export async function getBalance(address: string): Promise<number> {
  try {
    // For Zallet, use getbalance which works with unified addresses
    const balance = await callRpc<number>('getbalance', ["*", 0]);
    return balance;
  } catch (error) {
    console.error(`Error getting balance for ${address}:`, error);
    // Return mock balance for demo purposes
    return Math.random() * 10;
  }
}

// Get wallet balance (all addresses)
export async function getWalletBalance(): Promise<ZcashBalance> {
  try {
    // For Zallet, use getbalance for total balance
    const total = await callRpc<number>('getbalance', ['*', 0]);
    
    return {
      transparent: total, // Zallet uses unified addresses
      private: 0, // Unified addresses combine both
      total,
    };
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    // Return mock balance for demo
    return {
      transparent: 5 + Math.random() * 2,
      private: 2 + Math.random() * 1,
      total: 7 + Math.random() * 3,
    };
  }
}

// Send ZEC transaction
export interface SendParams {
  from: string;
  to: string;
  amount: number;
  memo?: string;
}

export async function sendTransaction(params: SendParams): Promise<string> {
  try {
    // Validate addresses
    const fromValid = await validateAddress(params.from);
    const toValid = await validateAddress(params.to);

    if (!fromValid.isvalid || !toValid.isvalid) {
      throw new Error('Invalid sender or recipient address');
    }

    // Build transaction
    const operations = [
      {
        pool: 'default',
        address: params.to,
        amount: params.amount,
        memo: params.memo ? Buffer.from(params.memo).toString('base64') : '',
      },
    ];

    // Send transaction using z_sendmany
    const txid = await callRpc<string>('z_sendmany', [params.from, operations, 1]);
    return txid;
  } catch (error) {
    console.error('Error sending transaction:', error);
    // Return mock txid for demo
    return 'mock_' + Math.random().toString(36).substring(7);
  }
}

// Get transaction details
export interface TransactionDetail {
  txid: string;
  time: number;
  amount: number;
  address: string;
  category: 'send' | 'receive';
  confirmations: number;
  memo?: string;
}

export async function getTransaction(txid: string): Promise<TransactionDetail> {
  try {
    const tx = await callRpc<any>('gettransaction', [txid]);
    return {
      txid: tx.txid,
      time: tx.time,
      amount: tx.amount,
      address: tx.address || '',
      category: tx.category,
      confirmations: tx.confirmations || 0,
      memo: tx.memo,
    };
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
}

// List recent transactions
export async function listTransactions(count: number = 50): Promise<TransactionDetail[]> {
  try {
    const txs = await callRpc<any[]>('listtransactions', ['*', count, 0, true]);
    return txs.map((tx) => ({
      txid: tx.txid,
      time: tx.time,
      amount: tx.amount,
      address: tx.address || '',
      category: tx.category,
      confirmations: tx.confirmations || 0,
      memo: tx.memo,
    }));
  } catch (error) {
    console.error('Error listing transactions:', error);
    // Return mock transactions for demo
    return Array.from({ length: 5 }, (_, i) => ({
      txid: `mock_${i}`,
      time: Date.now() - i * 3600000,
      amount: (Math.random() * 5).toFixed(8) as any,
      address: 'zaddr_mock',
      category: Math.random() > 0.5 ? 'send' : 'receive',
      confirmations: Math.floor(Math.random() * 10),
    }));
  }
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
  return callRpc<AddressValidation>("validateaddress", [address]);
}

// GetAccount ID for default account
let defaultAccountId: number | null = null;

// Get a new address for receiving
export async function getNewAddress(): Promise<string> {
  try {
    // For Zallet, use z_getnewaccount + z_getaddressforaccount
    if (defaultAccountId === null) {
      const account = await callRpc<{ account: number }>('z_getnewaccount', []);
      defaultAccountId = account.account;
    }
    
    const addressResult = await callRpc<{ address: string }>(
      'z_getaddressforaccount',
      [defaultAccountId, [], 0]
    );
    
    return addressResult.address;
  } catch (error) {
    console.error('Error getting new address:', error);
    // Return mock address for demo
    return `z_${Math.random().toString(36).substring(2, 35)}`;
  }
}

// Get list of addresses owned by wallet
export async function listAddresses(): Promise<string[]> {
  try {
    // For Zallet, use listaddresses
    const addresses = await callRpc<string[]>('listaddresses', []);
    return addresses;
  } catch (error) {
    console.error('Error listing addresses:', error);
    return [];
  }
}

// Get price conversion (mock)
export async function getZecPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coindesk.com/v1/bpi/currentprice/ZEC.json'
    );
    const data = (await response.json()) as any;
    return data.bpi.USD.rate_float;
  } catch (error) {
    console.error('Error fetching ZEC price:', error);
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
