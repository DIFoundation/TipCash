'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send, ArrowDownLeft, Heart, Link as LinkIcon } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Link href="/send">
        <Button className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Send Tip
        </Button>
      </Link>
      <Link href="/receive">
        <Button variant="outline" className="w-full" size="lg">
          <ArrowDownLeft className="mr-2 h-4 w-4" />
          Receive
        </Button>
      </Link>
      <Link href="/transactions">
        <Button variant="outline" className="w-full" size="lg">
          History
        </Button>
      </Link>
      <Link href="/search">
        <Button variant="outline" className="w-full" size="lg">
          Search
        </Button>
      </Link>
      <Link href="/favorites">
        <Button variant="outline" className="w-full" size="lg">
          <Heart className="mr-2 h-4 w-4" />
          Favorites
        </Button>
      </Link>
      <Link href="/receive-links">
        <Button variant="outline" className="w-full" size="lg">
          <LinkIcon className="mr-2 h-4 w-4" />
          Links
        </Button>
      </Link>
    </div>
  );
}
