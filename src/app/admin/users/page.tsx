import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

async function getUsers(search?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('installers')
    .select('id, nombre, apellido, nombre_comercial, ciudad, provincia, plan, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,nombre_comercial.ilike.%${search}%`)
  }

  const { data } = await query
  return data ?? []
}

interface Props { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const users = await getUsers(q)

  const planColor: Record<string, string> = {
    FREE: 'text-slate-400',
    PRO: 'text-blue-400',
    PREMIUM: 'text-yellow-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Usuarios</h1>
        <span className="text-slate-400 text-sm">{users.length} resultados</span>
      </div>

      <form method="GET">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
        />
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Nombre</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Ciudad</th>
              <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="p-3 text-slate-200 font-medium">
                  {u.nombre_comercial ?? `${u.nombre} ${u.apellido}`}
                </td>
                <td className="p-3 text-slate-400 hidden md:table-cell">{u.ciudad}</td>
                <td className={`p-3 font-semibold ${planColor[u.plan] ?? 'text-slate-400'}`}>{u.plan}</td>
                <td className="p-3 hidden md:table-cell">
                  <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/users/${u.id}`} className="text-slate-400 hover:text-orange-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
