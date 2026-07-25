'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Proposal {
  proposal: any;
  toAddress: string;
  amount: number;
  memo?: string;
  status: string;
}

interface quickSend {
  address: string;
  amount: number;
  memo: string
}

export default function SendZecPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  // const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [proposal, setProposal] = useState<Proposal | null>(null);
  const [quick, setQuick] = useState<quickSend | null>(null);
  // const [confirming, setConfirming] = useState(false);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setError('');
    setSuccess('');
    // setProposal(null);
    setQuick(null);
    setLoading(true);

    try {
      const response = await fetch('/api/zcash/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          toAddress,
          amount: parseFloat(amount),
          // memo: memo || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send ZEC');
      }

      const data = await response.json();
      setSuccess('ZEC sent successfully!');
      setToAddress('');
      setAmount('');
      // setMemo('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send ZEC');
    } finally {
      setLoading(false);
    }
  };

  // const handlePropose = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!accessToken) return;

  //   setError('');
  //   setSuccess('');
  //   // setProposal(null);
  //   setQuick(null);
  //   setLoading(true);

  //   try {
  //     const response = await fetch('/api/zcash/propose', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         toAddress,
  //         amount: parseFloat(amount),
  //         memo: memo || undefined,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(data.error || 'Failed to propose transaction');
  //     }

  //     const data = await response.json();
  //     // setProposal(data);
  //     setSuccess('Transaction proposed. Please review and confirm.');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to propose transaction');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleConfirm = async () => {
  //   if (!accessToken || !proposal) return;

  //   setError('');
  //   setSuccess('');
  //   setConfirming(true);

  //   try {
  //     const response = await fetch('/api/zcash/confirm', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         toAddress: proposal.toAddress,
  //         amount: proposal.amount,
  //         memo: proposal.memo,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(data.error || 'Failed to confirm transaction');
  //     }

  //     const data = await response.json();
  //     setSuccess(`Transaction sent successfully! Transaction ID: ${data.txid}`);
  //     setProposal(null);
  //     setToAddress('');
  //     setAmount('');
  //     setMemo('');

  //     setTimeout(() => {
  //       router.push('/dashboard');
  //     }, 2000);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to confirm transaction');
  //   } finally {
  //     setConfirming(false);
  //   }
  // };

  // const handleCancel = () => {
  //   // setProposal(null);
  //   setQuick(null);
  //   setSuccess('');
  //   setError('');
  // };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Send ZEC</h1>

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

            <form onSubmit={handleQuickSend} className="space-y-6">
                <div>
                  <label htmlFor="toAddress" className="block text-sm font-medium text-foreground mb-2">
                    Recipient Address
                  </label>
                  <Input
                    id="toAddress"
                    type="text"
                    placeholder="tm..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the recipient&apos;s Zcash address
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

                {/* <div>
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
                </div> */}

                <Button type="submit" className="w-full" disabled={loading || !toAddress || !amount}>
                  {loading ? 'Tipping...' : 'Tip Beneficiary'}
                </Button>
              </form>

            {/* {!proposal ? (
              <form onSubmit={handlePropose} className="space-y-6">
                <div>
                  <label htmlFor="toAddress" className="block text-sm font-medium text-foreground mb-2">
                    Recipient Address
                  </label>
                  <Input
                    id="toAddress"
                    type="text"
                    placeholder="tm..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the recipient&apos;s Zcash address
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

                <Button type="submit" className="w-full" disabled={loading || !toAddress || !amount}>
                  {loading ? 'Proposing...' : 'Propose Transaction'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">Transaction Proposal</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">To:</span>
                      <span className="text-blue-900 font-mono">{proposal.toAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="text-blue-900 font-mono">{proposal.amount} ZEC</span>
                    </div>
                    {proposal.memo && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Memo:</span>
                        <span className="text-blue-900">{proposal.memo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <span className="text-blue-900">{proposal.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirm}
                    className="flex-1"
                    disabled={confirming}
                  >
                    {confirming ? 'Confirming...' : 'Confirm & Send'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                    disabled={confirming}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )} */}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
