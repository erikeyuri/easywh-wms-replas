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
import { Plus, Trash2, Eye, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function ProdutosPage() {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const res = await pb.collection('products').getFullList({ sort: '-created' })
    setData(res)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('products', () => {
    loadData()
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('products').create(Object.fromEntries(formData))
      setOpen(false)
      toast({ title: 'Sucesso', description: 'Produto cadastrado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await pb.collection('products').update(editItem.id, Object.fromEntries(formData))
      setEditItem(null)
      toast({ title: 'Sucesso', description: 'Produto atualizado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SKU</Label>
                  <Input name="sku" required />
                </div>
                <div className="grid gap-2">
                  <Label>Cód Barras</Label>
                  <Input name="barcode" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input name="description" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Curva ABC</Label>
                  <Select name="abcCurve" defaultValue="A">
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
                <div className="grid gap-2">
                  <Label>Grupo</Label>
                  <Input name="group" required />
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Input name="unit" required />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label>Comp. (cm)</Label>
                  <Input name="length" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label>Larg. (cm)</Label>
                  <Input name="width" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label>Alt. (cm)</Label>
                  <Input name="height" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label>Qtd Padrão</Label>
                  <Input name="standardQty" type="number" />
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
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">SKU</Label>
                  <p className="font-medium">{viewItem.sku}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cód Barras</Label>
                  <p className="font-medium">{viewItem.barcode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{viewItem.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grupo</Label>
                  <p className="font-medium">{viewItem.group}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unidade</Label>
                  <p className="font-medium">{viewItem.unit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Curva ABC</Label>
                  <p className="font-medium">{viewItem.abcCurve}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Comprimento</Label>
                  <p className="font-medium">{viewItem.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Largura</Label>
                  <p className="font-medium">{viewItem.width}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Altura</Label>
                  <p className="font-medium">{viewItem.height}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qtd Padrão</Label>
                  <p className="font-medium">{viewItem.standardQty}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={onEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SKU</Label>
                  <Input name="sku" defaultValue={editItem.sku} required />
                </div>
                <div className="grid gap-2">
                  <Label>Cód Barras</Label>
                  <Input name="barcode" defaultValue={editItem.barcode} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input name="description" defaultValue={editItem.description} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Curva ABC</Label>
                  <Select name="abcCurve" defaultValue={editItem.abcCurve || 'A'}>
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
                <div className="grid gap-2">
                  <Label>Grupo</Label>
                  <Input name="group" defaultValue={editItem.group} required />
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Input name="unit" defaultValue={editItem.unit} required />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label>Comp. (cm)</Label>
                  <Input name="length" type="number" step="0.01" defaultValue={editItem.length} />
                </div>
                <div className="grid gap-2">
                  <Label>Larg. (cm)</Label>
                  <Input name="width" type="number" step="0.01" defaultValue={editItem.width} />
                </div>
                <div className="grid gap-2">
                  <Label>Alt. (cm)</Label>
                  <Input name="height" type="number" step="0.01" defaultValue={editItem.height} />
                </div>
                <div className="grid gap-2">
                  <Label>Qtd Padrão</Label>
                  <Input name="standardQty" type="number" defaultValue={editItem.standardQty} />
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
                <TableHead className="pl-6">SKU</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Curva ABC</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium pl-6">{item.sku}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.group}</TableCell>
                  <TableCell>{item.abcCurve}</TableCell>
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
                        confirm('Deseja excluir?') && pb.collection('products').delete(item.id)
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
