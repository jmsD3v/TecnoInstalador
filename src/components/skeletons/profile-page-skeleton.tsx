import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="container max-w-2xl mx-auto px-4">
        <div className="relative bg-card rounded-2xl border border-border shadow-xl mt-0 p-5 pt-14">
          <Skeleton className="absolute -top-12 left-5 w-24 h-24 rounded-full" />
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
