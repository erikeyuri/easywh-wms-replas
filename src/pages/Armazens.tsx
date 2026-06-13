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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Plus, Trash2, Eye, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function ArmazensPage() {
  const [data, setData] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb
      .collection('warehouses')
      .getFullList({ sort: '-created', expand: 'companyId' })
    setData(res)
    const comps = await pb.collection('companies').getFullList()
    setCompanies(comps)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('warehouses', () => {
    loadData()
  })

  const filtered = filter === 'all' ? data : data.filter((item) => item.companyId === filter)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('warehouses').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Armazém cadastrado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('warehouses').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Armazém atualizado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm('Deseja excluir este armazém?')) {
      await pb.collection('warehouses').delete(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Armazéns</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Novo Armazém
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Armazém</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Empresa/Filial</Label>
                <Select name="companyId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Código</Label>
                <Input name="code" required />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input name="description" required />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select name="type" defaultValue="Físico">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Físico">Físico</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Cód ERP</Label>
                <Input name="erpCode" required />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Armazém</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{viewItem.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{viewItem.expand?.companyId?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{viewItem.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{viewItem.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cód ERP</Label>
                  <p className="font-medium">{viewItem.erpCode}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Armazém</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Empresa/Filial</Label>
                <Select name="companyId" defaultValue={editItem.companyId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Código</Label>
                <Input name="code" defaultValue={editItem.code} required />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input name="description" defaultValue={editItem.description} required />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select name="type" defaultValue={editItem.type || 'Físico'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Físico">Físico</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editItem.status || 'Ativo'}>
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
                <Label>Cód ERP</Label>
                <Input name="erpCode" defaultValue={editItem.erpCode} required />
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Cód</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium pl-6">{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.expand?.companyId?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
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
