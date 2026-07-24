'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SendPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/tips/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail || undefined,
          amount: parseFloat(amount),
          memo: memo || undefined,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send tip');
      }

      const data = await response.json();
      setSuccess(`Tip sent successfully! Transaction ID: ${data.txid}`);
      setRecipientEmail('');
      setAmount('');
      setMemo('');
      setIsAnonymous(false);

      setTimeout(() => {
        router.push('/transactions');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Send a Tip</h1>

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
                <label htmlFor="recipient" className="block text-sm font-medium text-foreground mb-2">
                  Recipient Email
                </label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the recipient&apos;s email address
                </p>
              </div>

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
              </div>

              <div>
                <label htmlFor="memo" className="block text-sm font-medium text-foreground mb-2">
                  Memo (Optional)
                </label>
                <Input
                  id="memo"
                  type="text"
                  placeholder="Add a note..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={loading}
                  className="rounded border-border"
                />
                <label htmlFor="anonymous" className="text-sm font-medium text-foreground cursor-pointer">
                  Send anonymously
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !recipientEmail || !amount}>
                {loading ? 'Sending...' : 'Send Tip'}
              </Button>
            </form>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
