'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const CHAIN = process.env.CHAIN;
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-start gap-2">
          <Link href="/dashboard" className="text-2xl font-bold text-foreground">
            TipCash
          </Link>
            <span className="bg-gray-500 text-white px-1 py-1 rounded text-xs">{CHAIN}</span>
        </div>
        {/* network badge */}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-foreground hover:text-primary transition">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-foreground hover:text-primary transition">
              History
            </Link>
            <Link href="/favorites" className="text-foreground hover:text-primary transition">
              Favorites
            </Link>
            <Link href="/receive-links" className="text-foreground hover:text-primary transition">
              Links
            </Link>
            <Link href="/settings" className="text-foreground hover:text-primary transition">
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.display_name}</p>
              <p className="text-xs text-muted-foreground">@{user?.username}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/50">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/dashboard"
              className="block text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="block text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <Link
              href="/favorites"
              className="block text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Favorites
            </Link>
            <Link
              href="/receive-links"
              className="block text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Receive Links
            </Link>
            <Link
              href="/settings"
              className="block text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <hr className="border-border" />
            <Button className="w-full" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
