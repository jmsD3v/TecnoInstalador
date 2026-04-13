function AdminSkel({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-700/50 ${className ?? ''}`} />
}

export default function AdminSubscriptionsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AdminSkel className="h-8 w-40" />
        <AdminSkel className="h-16 w-40 rounded-xl" />
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-3 border-b border-slate-700 grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <AdminSkel key={i} className="h-4" />)}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 border-b border-slate-700/50 grid grid-cols-5 gap-4">
            <AdminSkel className="h-4" />
            <AdminSkel className="h-4 w-16" />
            <AdminSkel className="h-4 w-20" />
            <AdminSkel className="h-4 w-20" />
            <AdminSkel className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
