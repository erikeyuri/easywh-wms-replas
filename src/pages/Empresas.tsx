import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search, Plus, Trash2, Eye, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function EmpresasPage() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb.collection('companies').getFullList({ sort: '-created' })
    setData(res)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('companies', () => {
    loadData()
  })

  const filtered = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()),
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('companies').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Empresa cadastrada.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('companies').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Empresa atualizada.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm('Deseja excluir esta empresa?')) {
      await pb.collection('companies').delete(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Empresas e Filiais</h2>
          <p className="text-muted-foreground">Gerencie as empresas e filiais do sistema.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Nova Filial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Empresa/Filial</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Código da Empresa</Label>
                <Input name="code" required />
              </div>
              <div className="grid gap-2">
                <Label>Código da Filial</Label>
                <Input name="branch" required />
              </div>
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input name="name" required />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
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
              <div className="grid gap-2">
                <Label>Código ERP</Label>
                <Input name="erp" required />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa/Filial</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Filial</Label>
                  <p className="font-medium">{viewItem.branch}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{viewItem.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{viewItem.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Código ERP</Label>
                  <p className="font-medium">{viewItem.erp}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Empresa/Filial</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Código da Empresa</Label>
                <Input name="code" defaultValue={editItem.code} required />
              </div>
              <div className="grid gap-2">
                <Label>Código da Filial</Label>
                <Input name="branch" defaultValue={editItem.branch} required />
              </div>
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input name="name" defaultValue={editItem.name} required />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editItem.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Código ERP</Label>
                <Input name="erp" defaultValue={editItem.erp} required />
              </div>
              <DialogFooter>
                <Button type="submit">Atualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card className="shadow-subtle">
        <CardHeader className="pb-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Cód Empresa</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cód ERP</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="font-medium pl-6">{item.code}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        item.status === 'Ativo'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none'
                          : 'shadow-none'
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.erp}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setViewItem(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
