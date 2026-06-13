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

export default function EnderecosPage() {
  const [data, setData] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb.collection('addresses').getFullList({ sort: '-created', expand: 'zoneId' })
    setData(res)
    const zs = await pb.collection('zones').getFullList()
    setZones(zs)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('addresses', () => {
    loadData()
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('addresses').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Endereço cadastrado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('addresses').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Endereço atualizado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Endereços</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Endereço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Endereço</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Código</Label>
                  <Input name="code" required />
                </div>
                <div className="grid gap-2">
                  <Label>Zona</Label>
                  <Select name="zoneId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Picking">Picking</SelectItem>
                      <SelectItem value="Pulmão">Pulmão</SelectItem>
                      <SelectItem value="Doca">Doca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Curva ABC</Label>
                  <Select name="abcCurve" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select name="lockStatus" defaultValue="Liberado">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Liberado">Liberado</SelectItem>
                      <SelectItem value="Bloqueado Total">Bloqueado Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Seq Picking</Label>
                  <Input name="pickingSequence" type="number" required />
                </div>
                <div className="grid gap-2">
                  <Label>Max Paletes</Label>
                  <Input name="maxPallets" type="number" defaultValue="1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Endereço</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Zona</Label>
                  <p className="font-medium">{viewItem.expand?.zoneId?.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{viewItem.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Curva ABC</Label>
                  <p className="font-medium">{viewItem.abcCurve}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{viewItem.lockStatus}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seq Picking</Label>
                  <p className="font-medium">{viewItem.pickingSequence}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Paletes</Label>
                  <p className="font-medium">{viewItem.maxPallets}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Volume</Label>
                  <p className="font-medium">{viewItem.maxVolume}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Peso</Label>
                  <p className="font-medium">{viewItem.maxWeight}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Endereço</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Código</Label>
                  <Input name="code" defaultValue={editItem.code} required />
                </div>
                <div className="grid gap-2">
                  <Label>Zona</Label>
                  <Select name="zoneId" defaultValue={editItem.zoneId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select name="type" defaultValue={editItem.type} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Picking">Picking</SelectItem>
                      <SelectItem value="Pulmão">Pulmão</SelectItem>
                      <SelectItem value="Doca">Doca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Curva ABC</Label>
                  <Select name="abcCurve" defaultValue={editItem.abcCurve} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select name="lockStatus" defaultValue={editItem.lockStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Liberado">Liberado</SelectItem>
                      <SelectItem value="Bloqueado Entrada">Bloqueado Entrada</SelectItem>
                      <SelectItem value="Bloqueado Saída">Bloqueado Saída</SelectItem>
                      <SelectItem value="Bloqueado Total">Bloqueado Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Seq Picking</Label>
                  <Input
                    name="pickingSequence"
                    type="number"
                    defaultValue={editItem.pickingSequence}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Paletes</Label>
                  <Input name="maxPallets" type="number" defaultValue={editItem.maxPallets} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Max Volume</Label>
                  <Input name="maxVolume" type="number" defaultValue={editItem.maxVolume} />
                </div>
                <div className="grid gap-2">
                  <Label>Max Peso</Label>
                  <Input name="maxWeight" type="number" defaultValue={editItem.maxWeight} />
                </div>
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
                <TableHead className="pl-6">Código</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Curva ABC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium pl-6">{item.code}</TableCell>
                  <TableCell>{item.expand?.zoneId?.code}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.abcCurve}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.lockStatus}</Badge>
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
                        confirm('Deseja excluir?') && pb.collection('addresses').delete(item.id)
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
