'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
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
  recipientAddress?: string;
}

export default function TransactionsPage() {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (!accessToken) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/tips/history', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.tips);
        }
      } catch (error) {
        console.error('[v0] Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accessToken]);

  const filtered = transactions.filter(
    (tx) => filter === 'all' || tx.direction === filter
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
              <p className="text-muted-foreground mt-2">
                View all your sent and received tips
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'sent', 'received'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Transactions List */}
            <Card className="divide-y divide-border overflow-hidden">
              {loading ? (
                <div className="p-8">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                filtered.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 md:p-6 flex items-center justify-between hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          tx.direction === 'sent'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {tx.direction === 'sent' ? (
                          <Send className="h-5 w-5" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {tx.direction === 'sent' ? 'Sent' : 'Received'} {tx.amount} ZEC
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.memo || 'No memo'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block text-xs font-medium px-3 py-1 rounded ${
                          tx.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2 font-mono truncate max-w-xs">
                        {tx.txid?.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
