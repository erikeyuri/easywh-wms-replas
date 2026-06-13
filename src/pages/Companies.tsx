import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { mockCompanies } from '@/lib/mock-data'
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

export default function Companies() {
  const [data, setData] = useState(mockCompanies)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const filteredData = data.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newItem = {
      id: Date.now().toString(),
      code: fd.get('code') as string,
      branch: fd.get('branch') as string,
      name: fd.get('name') as string,
      status: fd.get('status') as string,
      erp: fd.get('erp') as string,
    }
    setData([newItem, ...data])
    setIsOpen(false)
    toast({ title: 'Sucesso', description: 'Empresa/Filial adicionada com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Empresas e Filiais</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Empresa/Filial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Empresa / Filial</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Cód. Empresa</Label>
                  <Input id="code" name="code" required placeholder="Ex: EMP01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Cód. Filial</Label>
                  <Input id="branch" name="branch" required placeholder="Ex: FL01" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Filial</Label>
                <Input id="name" name="name" required placeholder="Ex: Matriz SP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="erp">Código ERP</Label>
                  <Input id="erp" name="erp" required placeholder="Ex: ERP-101" />
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
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou nome..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Cód. Empresa</TableHead>
              <TableHead>Cód. Filial</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cód. ERP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell>{item.branch}</TableCell>
                <TableCell>{item.name}</TableCell>
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
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
