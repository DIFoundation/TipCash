'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">TipCash</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8 text-center">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            The Future of Tipping
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Send and receive Zcash tips instantly. Private, secure, and decentralized. No middlemen.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Private</h3>
            <p className="text-muted-foreground">
              Send tips with complete privacy using Zcash shielded pools
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Instant</h3>
            <p className="text-muted-foreground">
              Near-instant transactions with minimal fees
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Global</h3>
            <p className="text-muted-foreground">
              Send tips to anyone, anywhere in the world
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground text-sm">
            TipCash © 2025. Built with Zcash for the community.
          </p>
        </div>
      </footer>
    </main>
  );
}
