import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Eye, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function OperatorsPage() {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb.collection('operators').getFullList({ sort: '-created' })
    setData(res)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('operators', () => {
    loadData()
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('operators').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Operador cadastrado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('operators').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Operador atualizado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Operadores</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Operador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Operador</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Código/Matrícula</Label>
                <Input name="code" required />
              </div>
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input name="name" required />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Acesso</Label>
                <Select name="access_type" defaultValue="collector">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="collector">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Senha (Admin/Master)</Label>
                <Input name="password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label>Código de Barras (Coletor)</Label>
                <Input name="barcode" />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Operador</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código/Matrícula</Label>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{viewItem.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Acesso</Label>
                  <p className="font-medium">{viewItem.access_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{viewItem.status || 'active'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cód Barras</Label>
                  <p className="font-medium">{viewItem.barcode || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Operador</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Código/Matrícula</Label>
                <Input name="code" defaultValue={editItem.code} required />
              </div>
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input name="name" defaultValue={editItem.name} required />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Acesso</Label>
                <Select name="access_type" defaultValue={editItem.access_type || 'collector'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="collector">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editItem.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Senha (Admin/Master)</Label>
                <Input name="password" type="password" placeholder="Em branco para não alterar" />
              </div>
              <div className="grid gap-2">
                <Label>Código de Barras (Coletor)</Label>
                <Input name="barcode" defaultValue={editItem.barcode} />
              </div>
              <DialogFooter>
                <Button type="submit">Atualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium pl-6">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.access_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setViewItem(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        confirm('Deseja excluir?') && pb.collection('operators').delete(item.id)
                      }
                    >
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
