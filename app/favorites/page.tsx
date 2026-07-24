'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Send, Heart } from 'lucide-react';

interface Favorite {
  id: string;
  favoriteUserId: string;
  createdAt: string;
}

interface FavoriteUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          // In a real implementation, this would return full user data
          // For now, we'll show the favorite IDs
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        console.error('[v0] Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [accessToken]);

  const handleRemoveFavorite = async (userId: string) => {
    if (!accessToken) return;

    setRemoving(userId);
    try {
      const response = await fetch(`/api/favorites/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        setFavorites(favorites.filter((f) => f.id !== userId));
      }
    } catch (error) {
      console.error('[v0] Error removing favorite:', error);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Favorites</h1>
              <p className="text-muted-foreground mt-2">
                Your favorite users for quick tipping
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No favorites yet</p>
                <Link href="/search">
                  <Button>Find Users to Favorite</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="p-6 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {favorite.id}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Added to favorites
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/send?to=${favorite.id}`)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Tip
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          disabled={removing === favorite.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
