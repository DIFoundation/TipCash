'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';

interface BalanceResponse {
  transparent: number;
  private: number;
  total: number;
}

export function BalanceCard() {
  const { accessToken } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
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
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching balance');
        // Set mock balance for demo
        setBalance({ transparent: 0, private: 0, total: 0 });
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
            <div className="text-4xl font-bold text-foreground">
              <p className='text-2xl font mono'>
              <span className="text-primary">Transparent:</span>{" "}
              {balance?.transparent && balance?.transparent > 0 ? balance?.transparent : '0'} ZEC
              </p>
              <p className='text-2xl font-mono'>
              <span className="text-primary">Private:</span>{" "}
              {balance?.private && balance?.private > 0 ? balance?.private : '0'} ZEC
              </p>
              <p className=''>
              <span className="text-primary">Total:</span>{" "}
              {balance?.total && balance?.total > 0 ? balance?.total : '0'} ZEC
              </p>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </Card>
  );
}
