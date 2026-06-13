import { useEffect, useState } from 'react'
import { Building2, Layers, MapPin, Package, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const [stats, setStats] = useState({
    companies: 0,
    warehouses: 0,
    zonesAddresses: 0,
    products: 0,
  })
  const [movements, setMovements] = useState<any[]>([])

  const loadData = async () => {
    const c = await pb.collection('companies').getList(1, 1)
    const w = await pb.collection('warehouses').getList(1, 1)
    const z = await pb.collection('zones').getList(1, 1)
    const a = await pb.collection('addresses').getList(1, 1)
    const p = await pb.collection('products').getList(1, 1)
    setStats({
      companies: c.totalItems,
      warehouses: w.totalItems,
      zonesAddresses: z.totalItems + a.totalItems,
      products: p.totalItems,
    })

    const movs = await pb
      .collection('movements')
      .getList(1, 5, { sort: '-created', expand: 'product_id' })
    setMovements(movs.items)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('movements', () => {
    loadData()
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral da estrutura de armazenagem e integrações.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
          <ShieldCheck className="w-4 h-4" /> ERP Sincronizado
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-elevation hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas/Filiais
            </CardTitle>
            <Building2 className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-elevation hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Armazéns</CardTitle>
            <Layers className="w-5 h-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.warehouses}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-elevation hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zonas & Endereços
            </CardTitle>
            <MapPin className="w-5 h-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.zonesAddresses}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-elevation hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SKUs Ativos</CardTitle>
            <Package className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-elevation">
          <CardHeader>
            <CardTitle className="text-lg">Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {m.type.toUpperCase()}: {m.quantity} UN
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {m.expand?.product_id?.sku} | {m.origin_address} {'->'}{' '}
                      {m.destination_address}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.created).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {movements.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
