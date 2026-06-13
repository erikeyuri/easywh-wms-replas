import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, MinusCircle } from 'lucide-react'

export default function AjustesPage() {
  const { toast } = useToast()

  const handleAjuste = (e: React.FormEvent, type: 'in' | 'out') => {
    e.preventDefault()
    toast({
      title: 'Ajuste Registrado',
      description: `Movimentação de ${type === 'in' ? 'Entrada' : 'Saída'} realizada com sucesso e gravada em log.`,
      className: type === 'in' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Ajustes de Inventário</h1>
        <p className="text-muted-foreground text-sm">Entradas avulsas e baixas por perda/avaria.</p>
      </div>

      <Tabs defaultValue="in" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14">
          <TabsTrigger value="in" className="text-base">
            <PlusCircle className="w-4 h-4 mr-2" /> Entrada
          </TabsTrigger>
          <TabsTrigger value="out" className="text-base">
            <MinusCircle className="w-4 h-4 mr-2" /> Baixa (Saída)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrada Avulsa</CardTitle>
              <CardDescription>Adicionar saldo sem documento fiscal originário.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleAjuste(e, 'in')} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU / Produto</Label>
                    <Input required placeholder="Ex: SKU-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço Destino</Label>
                    <Input required placeholder="Ex: A-01-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" required min="0.01" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lote (Opcional)</Label>
                    <Input placeholder="Ex: L2024" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Textarea required placeholder="Justificativa para a entrada avulsa..." />
                </div>
                <Button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Registrar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Baixa de Saldo</CardTitle>
              <CardDescription>Remover saldo por perda, avaria ou validade.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleAjuste(e, 'out')} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Endereço Origem</Label>
                    <Input required placeholder="Ex: A-01-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU / Produto</Label>
                    <Input required placeholder="Ex: SKU-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade a Baixar</Label>
                    <Input type="number" required min="0.01" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Código do Motivo</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>Avaria na Operação</option>
                      <option>Vencimento</option>
                      <option>Ajuste de Inventário</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea required placeholder="Detalhes adicionais..." />
                </div>
                <Button type="submit" variant="destructive" className="w-full mt-4">
                  Confirmar Baixa
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
