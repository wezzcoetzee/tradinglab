import { Suspense } from "react";
import { Dashboard } from "@/components/backtest";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="h-12 w-64 bg-muted animate-pulse rounded" />
      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        <div className="h-96 bg-muted animate-pulse rounded" />
        <div className="space-y-6">
          <div className="h-48 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}