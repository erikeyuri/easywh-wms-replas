import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { mockWarehouses, mockCompanies } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function Warehouses() {
  const [data, setData] = useState(mockWarehouses)
  const [filterCompanyId, setFilterCompanyId] = useState('all')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const filteredData =
    filterCompanyId === 'all' ? data : data.filter((w) => w.companyId === filterCompanyId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newItem = {
      id: Date.now().toString(),
      companyId: fd.get('companyId') as string,
      code: fd.get('code') as string,
      description: fd.get('description') as string,
      type: fd.get('type') as string,
      status: fd.get('status') as string,
      erp: fd.get('erp') as string,
    }
    setData([newItem, ...data])
    setIsOpen(false)
    toast({ title: 'Sucesso', description: 'Armazém cadastrado com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Armazéns</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Armazém
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Armazém</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Empresa / Filial Vinculada</Label>
                <Select name="companyId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Cód. Armazém</Label>
                  <Input id="code" name="code" required placeholder="Ex: ARM-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erp">Código ERP</Label>
                  <Input id="erp" name="erp" required placeholder="Ex: WH-01" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  required
                  placeholder="Ex: Armazém Central"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Tipo de Armazém</Label>
                  <RadioGroup name="type" defaultValue="Real" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Real" id="r1" />
                      <Label htmlFor="r1" className="font-normal cursor-pointer">
                        Real
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Virtual" id="r2" />
                      <Label htmlFor="r2" className="font-normal cursor-pointer">
                        Virtual
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="Ativo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Salvar Cadastro</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center w-full max-w-sm">
        <Select value={filterCompanyId} onValueChange={setFilterCompanyId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filtrar por Empresa/Filial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Empresas/Filiais</SelectItem>
            {mockCompanies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-md border shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Cód. Armazém</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cód. ERP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => {
              const comp = mockCompanies.find((c) => c.id === item.companyId)
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {comp ? comp.branch : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.type === 'Virtual'
                          ? 'border-dashed text-slate-500'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50'
                      }
                    >
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        item.status === 'Ativo'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{item.erp}</TableCell>
                </TableRow>
              )
            })}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum armazém encontrado para este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
