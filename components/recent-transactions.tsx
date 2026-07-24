'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  txid: string;
  amount: number;
  memo?: string;
  direction: 'sent' | 'received';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  recipientUsername?: string;
}

export function RecentTransactions() {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/tips/history', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.tips.slice(0, 5));
        }
      } catch (error) {
        console.error('[v0] Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accessToken]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
      
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    tx.direction === 'sent'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {tx.direction === 'sent' ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tx.direction === 'sent' ? 'Sent' : 'Received'} {tx.amount} ZEC
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  tx.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : tx.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
