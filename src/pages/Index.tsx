import { useAppStore } from '@/stores/use-app-store'
import { ContextSwitcher } from '@/components/ContextSwitcher'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Search, PackagePlus, ArrowRightLeft, Target, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  occupied: { label: 'Ocupado', color: 'hsl(var(--chart-1))' },
  free: { label: 'Livre', color: 'hsl(var(--chart-2))' },
  locked: { label: 'Bloqueado', color: 'hsl(var(--chart-4))' },
}

export default function Index() {
  const { role, activeWarehouse } = useAppStore()

  const mockChartData = [
    { name: 'Ocupado', value: 450, fill: 'var(--color-occupied)' },
    { name: 'Livre', value: 300, fill: 'var(--color-free)' },
    { name: 'Bloqueado', value: 50, fill: 'var(--color-locked)' },
  ]

  if (!activeWarehouse) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo ao EasyWH</h1>
          <p className="text-muted-foreground text-lg">
            Sistema de Gestão de Armazéns de Alta Eficiência.
          </p>
        </div>
        <Card className="border-primary/20 shadow-elevation">
          <CardHeader>
            <CardTitle>Definir Contexto de Trabalho</CardTitle>
            <CardDescription>Selecione a unidade operacional para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContextSwitcher />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (role === 'operator') {
    return (
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl font-bold">Acesso Rápido - Operador</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/enderecamento">
            <Card className="hover:border-primary cursor-pointer transition-colors h-full">
              <CardContent className="flex items-center p-6 gap-6">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <PackagePlus className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Endereçamento</h3>
                  <p className="text-muted-foreground">Guardar itens recebidos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/transferencia">
            <Card className="hover:border-primary cursor-pointer transition-colors h-full">
              <CardContent className="flex items-center p-6 gap-6">
                <div className="p-4 bg-secondary/10 rounded-full text-secondary-foreground">
                  <ArrowRightLeft className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Transferência</h3>
                  <p className="text-muted-foreground">Mover entre endereços</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/saldos" className="sm:col-span-2">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="flex items-center justify-center p-6 gap-4">
                <Search className="w-8 h-8 text-muted-foreground" />
                <h3 className="text-xl font-bold">Consulta de Saldos</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Central</h1>
          <p className="text-muted-foreground">Visão geral da operação em {activeWarehouse.name}</p>
        </div>
        <div className="hidden md:block">
          <ContextSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Tarefas Pendentes
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Endereçamentos aguardando</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Ocupação
              <Target className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">60%</div>
            <p className="text-xs text-muted-foreground mt-1">+2% desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Movimentações Hoje
              <ArrowRightLeft className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground mt-1">Paletes movimentados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Ocupação de Endereços</CardTitle>
            <CardDescription>Distribuição atual de posições no armazém</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avisos do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">
                  Zona de Picking próxima do limite
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Considere realizar ressuprimento preventivo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
