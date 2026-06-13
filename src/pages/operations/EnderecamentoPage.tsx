import { useState, useRef, useEffect } from 'react'
import { MOCK_BALANCES, MOCK_PRODUCTS, MOCK_ADDRESSES } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowRight, CheckCircle2, Scan } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EnderecamentoPage() {
  const { toast } = useToast()
  // Mock items pending putaway (in Recebimento zone)
  const pendingItems = MOCK_BALANCES.filter((b) => {
    const addr = MOCK_ADDRESSES.find((a) => a.id === b.addressId)
    return addr?.zone === 'Recebimento'
  }).map((b) => ({
    ...b,
    product: MOCK_PRODUCTS.find((p) => p.id === b.productId),
    suggestedAddress: MOCK_ADDRESSES.find((a) => a.status === 'free'),
  }))

  const [selectedItem, setSelectedItem] = useState<(typeof pendingItems)[0] | null>(null)
  const [scannedAddress, setScannedAddress] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectedItem && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedItem])

  const handleConfirm = () => {
    if (!scannedAddress) return
    const addressExists = MOCK_ADDRESSES.find(
      (a) => a.code.toLowerCase() === scannedAddress.toLowerCase(),
    )

    if (!addressExists) {
      toast({
        title: 'Erro',
        description: 'Endereço inválido ou inexistente.',
        variant: 'destructive',
      })
      setScannedAddress('')
      return
    }
    if (addressExists.status === 'locked') {
      toast({
        title: 'Acesso Negado',
        description: 'Endereço bloqueado para entrada.',
        variant: 'destructive',
      })
      setScannedAddress('')
      return
    }

    toast({
      title: 'Sucesso',
      description: `Produto endereçado em ${addressExists.code}`,
      className: 'bg-emerald-600 text-white border-none',
    })
    setSelectedItem(null)
    setScannedAddress('')
  }

  if (selectedItem) {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-slide-up">
        <Button variant="ghost" onClick={() => setSelectedItem(null)} className="mb-4">
          &larr; Voltar para lista
        </Button>
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle>Confirmar Destino</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Produto a guardar</p>
              <p className="font-bold text-lg">{selectedItem.product?.sku}</p>
              <p className="text-sm">{selectedItem.product?.name}</p>
              <div className="mt-2 text-2xl font-black">
                {selectedItem.qty}{' '}
                <span className="text-base font-normal text-muted-foreground">
                  {selectedItem.product?.uom}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-2 border-dashed border-primary/50 p-4 rounded-lg bg-primary/5">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Destino Sugerido
              </p>
              <p className="text-2xl font-mono font-bold tracking-wider">
                {selectedItem.suggestedAddress?.code}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Scan className="w-4 h-4" /> Escanear Endereço Real
              </label>
              <Input
                ref={inputRef}
                value={scannedAddress}
                onChange={(e) => setScannedAddress(e.target.value)}
                className="h-14 text-xl font-mono uppercase text-center border-2 focus-visible:ring-primary animate-scan-pulse"
                placeholder="Ex: A-01-02"
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleConfirm}
              className="w-full h-14 text-lg"
              disabled={!scannedAddress}
            >
              Confirmar Endereçamento <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Tarefas de Endereçamento</h1>
        <p className="text-muted-foreground text-sm">Selecione um item pendente para guardar.</p>
      </div>

      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhuma tarefa de endereçamento pendente.
          </div>
        ) : (
          pendingItems.map((item) => (
            <Card
              key={item.id}
              className="hover:border-primary cursor-pointer transition-all"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono">
                      {item.product?.sku}
                    </Badge>
                    <span className="font-bold">
                      {item.qty} {item.product?.uom}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.product?.name}</p>
                </div>
                <div className="flex items-center text-primary font-medium gap-2 text-sm bg-primary/10 px-3 py-2 rounded-md">
                  <ArrowRight className="w-4 h-4" />
                  {item.suggestedAddress?.code}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
