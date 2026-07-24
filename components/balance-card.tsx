'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';

export function BalanceCard() {
  const { accessToken } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/zcash/balance', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch balance');

        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching balance');
        // Set mock balance for demo
        setBalance(5.5 + Math.random() * 2);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [accessToken]);

  return (
    <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
        <div className="space-y-1">
          {loading ? (
            <div className="h-12 w-32 rounded bg-muted animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-foreground">
              {balance !== null ? balance : '0'} ZEC
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </Card>
  );
}
