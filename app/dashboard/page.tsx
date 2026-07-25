'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { BalanceCard } from '@/components/balance-card';
import { QuickActions } from '@/components/quick-actions';
import { RecentTransactions } from '@/components/recent-transactions';
import { ExplorerTransactions } from '@/components/explorer-transactions';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Balance */}
            <BalanceCard />

            {/* Quick Actions */}
            <QuickActions />

            {/* Blockchain Transactions */}
            <ExplorerTransactions />

            {/* Recent Transactions */}
            {/* <RecentTransactions /> */}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
