import { EventGridSkeleton, StatSkeleton } from "@/components/skeletons";

export default function AppLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-3 w-40 animate-pulse rounded bg-ink/[0.08]" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded-xl bg-ink/[0.1]" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <EventGridSkeleton count={6} />
    </div>
  );
}
