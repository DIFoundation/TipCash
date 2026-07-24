'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { QRCodeDisplay } from '@/components/qr-code';

export default function ReceivePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [receiveLink, setReceiveLink] = useState('');

  useEffect(() => {
    if (user) {
      const link = `${window.location.origin}/receive/${user.id}`;
      setReceiveLink(link);
    }
  }, [user]);

  const handleCopyAddress = () => {
    if (user?.zcashAddress) {
      navigator.clipboard.writeText(user.zcashAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(receiveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Receive Tips</h1>
              <p className="text-muted-foreground mt-2">
                Share your address or link to receive Zcash tips
              </p>
            </div>

            {/* Direct Address */}
            <Card className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your Zcash Address
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this address to receive tips directly
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Address Section */}
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
                      {user?.zcashAddress || 'Loading...'}
                    </div>

                    <Button
                      onClick={handleCopyAddress}
                      className="w-full"
                      variant={copied ? 'default' : 'outline'}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Address
                        </>
                      )}
                    </Button>
                  </div>

                  {/* QR Code Section */}
                  {user?.zcashAddress && (
                    <div className="flex justify-center">
                      <QRCodeDisplay
                        value={user.zcashAddress}
                        label="Scan to send tips"
                        size={200}
                        showDownload={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Shareable Link */}
            <Card className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Shareable Link
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this link for an easy way to receive tips
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Link Section */}
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
                      {receiveLink}
                    </div>

                    <Button
                      onClick={handleCopyLink}
                      className="w-full"
                      variant={copied ? 'default' : 'outline'}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>

                  {/* QR Code Section */}
                  {receiveLink && (
                    <div className="flex justify-center">
                      <QRCodeDisplay
                        value={receiveLink}
                        label="Scan to share receive link"
                        size={200}
                        showDownload={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Tips for Receiving</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Your Zcash address is unique to you</li>
                <li>• You can receive tips from anyone with your address</li>
                <li>• All tips go directly to your wallet</li>
                <li>• Email notifications will be sent when you receive tips</li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
