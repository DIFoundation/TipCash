'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${params.username}`);
        if (!response.ok) throw new Error('Profile not found');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <p className="text-red-600">{error || 'Profile not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.username === profile.username;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Profile Header */}
            <div>
              <h1 className="text-4xl font-bold text-foreground">{profile.displayName}</h1>
              <p className="text-muted-foreground text-lg mt-2">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground text-lg">{profile.bio}</p>
            )}

            {/* Joined Date */}
            <div className="text-sm text-muted-foreground">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {!isOwnProfile && (
                <>
                  <Button
                    onClick={() => router.push(`/send?to=${profile.username}`)}
                    className="flex-1"
                  >
                    Send Tip
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                    />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                </>
              )}
              {isOwnProfile && (
                <Button onClick={() => router.push('/settings')} className="flex-1">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
