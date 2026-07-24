'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, accessToken, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          displayName,
          bio: bio || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      updateUser(data);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your profile and preferences
              </p>
            </div>

            {/* Profile Settings */}
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Profile</h2>

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
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about yourself..."
                    maxLength={500}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground disabled:opacity-50"
                    rows={4}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {bio.length}/500 characters
                  </p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Card>

            {/* Account Info */}
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Account Information</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Zcash Address</p>
                  <p className="text-foreground font-mono break-all mt-1">
                    {user?.zcashAddress}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Created</p>
                  <p className="text-foreground mt-1">
                    {user && new Date(user.id).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
