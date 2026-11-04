export function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-cream ring-1 ring-ink/10">
      <div className="h-36 animate-pulse bg-ink/[0.08]" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-ink/[0.08]" />
        <div className="h-6 w-4/5 animate-pulse rounded-lg bg-ink/[0.08]" />
        <div className="h-4 w-2/5 animate-pulse rounded-lg bg-ink/[0.06]" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-ink/[0.08]" />
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10">
      <div className="h-4 w-24 animate-pulse rounded bg-ink/[0.08]" />
      <div className="mt-3 h-9 w-16 animate-pulse rounded bg-ink/[0.1]" />
    </div>
  );
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-cream p-4 ring-1 ring-ink/10"
        >
          <div className="size-12 animate-pulse rounded-xl bg-ink/[0.08]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-ink/[0.08]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}
