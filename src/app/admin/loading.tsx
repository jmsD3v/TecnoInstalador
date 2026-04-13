function AdminSkel({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-700/50 ${className ?? ''}`} />
}

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <AdminSkel className="h-8 w-32" />
        <AdminSkel className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <AdminSkel key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <AdminSkel key={i} className="h-20" />)}
      </div>
    </div>
  )
}
