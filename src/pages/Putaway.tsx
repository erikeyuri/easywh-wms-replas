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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function PutawayPage() {
  const [data, setData] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [suggestedAddr, setSuggestedAddr] = useState<any>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [receiptRes, balanceRes] = await Promise.all([
        pb.collection('receipt_items').getFullList({
          filter: "status='pending_putaway'",
          expand: 'product_id',
        }),
        pb.collection('balances').getFullList({
          filter: "address_id=''",
          expand: 'product_id',
        }),
      ])

      const unified = [
        ...receiptRes.map((item) => ({
          ...item,
          _type: 'receipt',
          _qty: item.quantity,
        })),
        ...balanceRes.map((item) => ({
          ...item,
          _type: 'balance',
          _qty: item.quantity_available,
        })),
      ]
      setData(unified)
    } catch (error) {
      console.error('Error loading putaway data:', error)
    }
  }

  const loadAddresses = async () => {
    try {
      const addrs = await pb.collection('addresses').getFullList({
        filter: "lockStatus='Liberado'",
      })
      setAddresses(addrs)
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  useEffect(() => {
    loadData()
    loadAddresses()
  }, [])

  useRealtime('receipt_items', () => {
    loadData()
  })

  useRealtime('balances', () => {
    loadData()
  })

  useRealtime('addresses', () => {
    loadAddresses()
  })

  const handleSuggest = (item: any) => {
    setSelectedItem(item)
    const abc = item.expand?.product_id?.abcCurve || 'A'
    const suggested = addresses.find((a) => a.abcCurve === abc && a.type === 'Picking')
    setSuggestedAddr(suggested || null)
    setSelectedAddressId(suggested?.id || '')
  }

  const confirmPutaway = async () => {
    if (!selectedAddressId) return

    const targetAddress = addresses.find((a) => a.id === selectedAddressId)
    if (!targetAddress) return

    try {
      if (selectedItem._type === 'receipt') {
        await pb.send('/backend/v1/putaway', {
          method: 'POST',
          body: JSON.stringify({
            receipt_item_id: selectedItem.id,
            destination_address_id: selectedAddressId,
          }),
        })
      } else {
        await pb.collection('balances').update(selectedItem.id, {
          address_id: selectedAddressId,
        })
        await pb.collection('movements').create({
          product_id: selectedItem.product_id,
          origin_address: '',
          destination_address: targetAddress.code,
          quantity: selectedItem._qty,
          batch: selectedItem.batch,
          type: 'transfer',
          operator_id: pb.authStore.record?.id,
        })
      }
      toast({ title: 'Sucesso', description: 'Endereçamento concluído!' })
      setSelectedItem(null)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Endereçamento (Putaway)</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Endereço Atual</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    {item.expand?.product_id?.sku} - {item.expand?.product_id?.description}
                  </TableCell>
                  <TableCell>{item._qty}</TableCell>
                  <TableCell>{item.batch || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item._type === 'receipt' ? 'default' : 'secondary'}>
                      {item._type === 'receipt' ? 'Recebimento' : 'Ajuste Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.current_address || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleSuggest(item)}>
                      Endereçar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum item pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Endereçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Produto</Label>
                <p className="font-medium">{selectedItem?.expand?.product_id?.sku}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Quantidade</Label>
                <p className="font-medium">{selectedItem?._qty}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Lote</Label>
                <p className="font-medium">{selectedItem?.batch || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Origem</Label>
                <p className="font-medium">
                  {selectedItem?._type === 'receipt' ? 'Recebimento' : 'Ajuste Manual'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço de Destino</Label>
              <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um endereço" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      {addr.code} {suggestedAddr?.id === addr.id ? '(Sugerido)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancelar
            </Button>
            <Button disabled={!selectedAddressId} onClick={confirmPutaway}>
              Confirmar Destino
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
