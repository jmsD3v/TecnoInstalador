import { Skeleton } from '@/components/ui/skeleton'

interface AdminTableSkeletonProps {
  rows?: number
  cols?: number
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }: AdminTableSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="border-t border-border pt-2 space-y-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton key={col} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
