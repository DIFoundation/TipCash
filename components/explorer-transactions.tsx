'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowDownLeft, ExternalLink } from 'lucide-react';

interface ExplorerTransaction {
  txid: string;
  blockHeight: number;
  blockTime: string;
  size: number;
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

export function ExplorerTransactions() {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<ExplorerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/zcash/explorer/transactions?page=1&limit=10', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');

        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching transactions');
        console.error('[Explorer] Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accessToken]);

  const getExplorerTxUrl = (txid: string) => {
    return `https://testnet.cipherscan.app/tx/${txid}`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Blockchain Transactions</h3>
      
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions found</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isReceived = tx.netChange > 0;
            const amount = Math.abs(tx.netChange);
            
            return (
              <div
                key={tx.txid}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      isReceived
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {isReceived ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {isReceived ? 'Received' : 'Sent'} {amount.toFixed(8)} TAZ
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Block: {tx.blockHeight}</span>
                      {tx.counterparty && (
                        <span>• Counterparty: {tx.counterparty.slice(0, 8)}...</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {tx.hasIronwood && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded">Ironwood</span>}
                      {tx.hasSapling && <span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded">Sapling</span>}
                      {tx.hasOrchard && <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded">Orchard</span>}
                    </div>
                  </div>
                </div>
                <a
                  href={getExplorerTxUrl(tx.txid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
