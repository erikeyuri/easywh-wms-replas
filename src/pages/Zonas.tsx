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

export default function ZonasPage() {
  const [data, setData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb
      .collection('zones')
      .getFullList({ sort: '-created', expand: 'warehouseId' })
    setData(res)
    const wh = await pb.collection('warehouses').getFullList()
    setWarehouses(wh)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('zones', () => {
    loadData()
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('zones').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Zona cadastrada.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('zones').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Zona atualizada.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zonas de Armazenagem</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nova Zona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Zona</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Armazém</Label>
                <Select name="warehouseId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.code} - {w.description}
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
                <Input name="type" required />
              </div>
              <div className="grid gap-2">
                <Label>Regra de Alocação</Label>
                <Select name="allocationRule" required defaultValue="FIFO">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO</SelectItem>
                    <SelectItem value="FEFO">FEFO</SelectItem>
                    <SelectItem value="LIFO">LIFO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Seq. Abastecimento</Label>
                <Input name="supplySequence" type="number" required />
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
            <DialogTitle>Detalhes da Zona</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Armazém</Label>
                  <p className="font-medium">{viewItem.expand?.warehouseId?.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{viewItem.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{viewItem.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Regra de Alocação</Label>
                  <p className="font-medium">{viewItem.allocationRule}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seq. Abastecimento</Label>
                  <p className="font-medium">{viewItem.supplySequence}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Zona</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Armazém</Label>
                <Select name="warehouseId" defaultValue={editItem.warehouseId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.code} - {w.description}
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
                <Input name="type" defaultValue={editItem.type} required />
              </div>
              <div className="grid gap-2">
                <Label>Regra de Alocação</Label>
                <Select name="allocationRule" defaultValue={editItem.allocationRule} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO</SelectItem>
                    <SelectItem value="FEFO">FEFO</SelectItem>
                    <SelectItem value="LIFO">LIFO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Seq. Abastecimento</Label>
                <Input
                  name="supplySequence"
                  type="number"
                  defaultValue={editItem.supplySequence}
                  required
                />
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
                <TableHead className="pl-6">Armazém</TableHead>
                <TableHead>Cód Zona</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Regra</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">{item.expand?.warehouseId?.description}</TableCell>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.allocationRule}</TableCell>
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
                        confirm('Deseja excluir?') && pb.collection('zones').delete(item.id)
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
