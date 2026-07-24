'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Plus, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { QRCodeDisplay } from '@/components/qr-code';

interface ReceiveLink {
  id: string;
  token: string;
  isAnonymous: boolean;
  usesRemaining: number;
  expiresAt?: string;
  createdAt: string;
}

export default function ReceiveLinksPage() {
  const { accessToken } = useAuth();
  const [links, setLinks] = useState<ReceiveLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/receive-links', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLinks(data.links || []);
        }
      } catch (error) {
        console.error('[v0] Error fetching receive links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [accessToken]);

  const handleCreateLink = async (isAnonymous: boolean = false) => {
    if (!accessToken) return;

    setCreating(true);
    try {
      const response = await fetch('/api/receive-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          isAnonymous,
          usesRemaining: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLinks([data.link, ...links]);
      }
    } catch (error) {
      console.error('[v0] Error creating receive link:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/tip/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Receive Links</h1>
              <p className="text-muted-foreground mt-2">
                Create shareable links for receiving anonymous tips
              </p>
            </div>

            {/* Create Link Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <LinkIcon className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-semibold text-foreground">Regular Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Recipient knows your identity
                  </p>
                  <Button
                    onClick={() => handleCreateLink(false)}
                    disabled={creating}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Regular Link
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center space-y-4">
                  <LinkIcon className="h-8 w-8 mx-auto text-purple-600" />
                  <h3 className="font-semibold text-foreground">Anonymous Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Recipient won&apos;t know who sent it
                  </p>
                  <Button
                    onClick={() => handleCreateLink(true)}
                    disabled={creating}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Anonymous Link
                  </Button>
                </div>
              </Card>
            </div>

            {/* Links List */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Links</h2>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : links.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No links created yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => {
                    const linkUrl = `${window.location.origin}/tip/${link.token}`;
                    const isExpanded = expandedQR === link.token;

                    return (
                      <Card key={link.id} className="overflow-hidden">
                        <div className="p-4 space-y-3">
                          {/* Header Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                  link.isAnonymous
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {link.isAnonymous ? 'Anonymous' : 'Regular'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Created {new Date(link.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExpandedQR(isExpanded ? null : link.token)}
                              >
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant={copied === link.token ? 'default' : 'outline'}
                                onClick={() => handleCopyLink(link.token)}
                              >
                                {copied === link.token ? (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Link Display */}
                          <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                            {linkUrl}
                          </div>

                          {/* Metadata */}
                          <div className="text-xs text-muted-foreground">
                            Uses remaining: {link.usesRemaining}
                            {link.expiresAt && ` • Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                          </div>

                          {/* Expanded QR Code Section */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex justify-center">
                                <QRCodeDisplay
                                  value={linkUrl}
                                  label="Scan to share this receive link"
                                  size={220}
                                  showDownload={true}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Share regular links with people who know you</li>
                <li>• Use anonymous links for surprise tips</li>
                <li>• Each link can be used multiple times</li>
                <li>• Links never expire unless you set an expiration date</li>
                <li>• Share links on social media or messaging apps</li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
