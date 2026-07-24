'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function AnonymousTipPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verify the token and send anonymous tip
      const response = await fetch('/api/tips/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiveLink: params.token,
          amount: parseFloat(amount),
          memo: memo || undefined,
          isAnonymous: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send tip');
      }

      const data = await response.json();
      setSuccess(`Tip sent successfully! Transaction ID: ${data.txid}`);
      setAmount('');
      setMemo('');

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Simple Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur p-4">
        <h1 className="text-2xl font-bold text-foreground">TipCash</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Send an Anonymous Tip
          </h2>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                Amount (ZEC)
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.00000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                How much Zcash would you like to send?
              </p>
            </div>

            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-foreground mb-2">
                Message (Optional)
              </label>
              <Input
                id="memo"
                type="text"
                placeholder="Add a message..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Your tip will be sent anonymously. The recipient will not know who sent it.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !amount}>
              {loading ? 'Sending...' : 'Send Anonymous Tip'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              TipCash - Private Zcash Tipping
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
