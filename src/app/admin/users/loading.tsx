function AdminSkel({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-700/50 ${className ?? ''}`} />
}

export default function AdminUsersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AdminSkel className="h-8 w-32" />
        <AdminSkel className="h-4 w-24" />
      </div>
      <AdminSkel className="h-10 w-full rounded-lg" />
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-3 border-b border-slate-700 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <AdminSkel key={i} className="h-4" />)}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-3 border-b border-slate-700/50 grid grid-cols-4 gap-4">
            <AdminSkel className="h-4" />
            <AdminSkel className="h-4" />
            <AdminSkel className="h-4 w-16" />
            <AdminSkel className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
