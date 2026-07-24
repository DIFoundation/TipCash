'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface SearchResult {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!accessToken) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('[v0] Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Find Users to Tip</h1>
              <p className="text-muted-foreground mt-2">
                Search for users and send them tips
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by username or display name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {/* Results */}
            <div className="space-y-4">
              {searched && results.length === 0 && !loading && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No users found matching your search</p>
                </Card>
              )}

              {loading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              )}

              {results.map((user) => (
                <Card key={user.id} className="p-6 hover:bg-muted/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${user.username}`}
                          className="text-lg font-semibold text-foreground hover:text-primary"
                        >
                          {user.displayName}
                        </Link>
                        <span className="text-sm text-muted-foreground">@{user.username}</span>
                      </div>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => router.push(`/send?to=${user.username}`)}
                      size="sm"
                    >
                      Tip
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
