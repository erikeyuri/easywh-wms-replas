import { useState, useRef, useEffect } from 'react'
import { MOCK_BALANCES, MOCK_PRODUCTS, MOCK_ADDRESSES, Address, Product } from '@/lib/mock-data'
import { useAppStore } from '@/stores/use-app-store'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Scan, Box, MapPin, ShoppingCart, ArrowRight } from 'lucide-react'

type Step = 'SOURCE' | 'PRODUCT' | 'QTY' | 'CART_REVIEW' | 'DESTINATION'

export default function TransferenciaPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('SOURCE')

  const [sourceAddress, setSourceAddress] = useState<Address | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<{
    product: Product
    maxQty: number
  } | null>(null)
  const [qtyInput, setQtyInput] = useState('')
  const [destCode, setDestCode] = useState('')

  const [cart, setCart] = useState<Array<{ product: Product; qty: number; source: Address }>>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [step])

  const handleSourceSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputRef.current?.value) return
    const code = inputRef.current.value.toUpperCase()
    const addr = MOCK_ADDRESSES.find((a) => a.code.toUpperCase() === code)
    if (!addr) {
      toast({ title: 'Erro', description: 'Endereço não encontrado.', variant: 'destructive' })
      return
    }
    setSourceAddress(addr)
    setStep('PRODUCT')
  }

  const handleProductSubmit = (sku: string) => {
    if (!sourceAddress) return
    const bal = MOCK_BALANCES.find(
      (b) =>
        b.addressId === sourceAddress.id &&
        MOCK_PRODUCTS.find((p) => p.id === b.productId)?.sku === sku,
    )
    if (!bal) {
      toast({
        title: 'Erro',
        description: 'Produto não encontrado neste endereço.',
        variant: 'destructive',
      })
      return
    }
    const prod = MOCK_PRODUCTS.find((p) => p.id === bal.productId)!
    setSelectedProduct({ product: prod, maxQty: bal.qty })
    setStep('QTY')
  }

  const handleQtySubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const qty = parseFloat(qtyInput)
    if (isNaN(qty) || qty <= 0 || qty > (selectedProduct?.maxQty || 0)) {
      toast({
        title: 'Erro',
        description: 'Quantidade inválida ou superior ao saldo.',
        variant: 'destructive',
      })
      return
    }
    setCart([...cart, { product: selectedProduct!.product, qty, source: sourceAddress! }])
    setQtyInput('')
    setSourceAddress(null)
    setSelectedProduct(null)
    setStep('CART_REVIEW')
    toast({ title: 'Adicionado', description: 'Item no carrinho virtual.' })
  }

  const handleDestSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const dest = MOCK_ADDRESSES.find((a) => a.code.toUpperCase() === destCode.toUpperCase())
    if (!dest) {
      toast({ title: 'Erro', description: 'Endereço de destino inválido.', variant: 'destructive' })
      return
    }
    if (dest.status === 'locked') {
      toast({
        title: 'Erro',
        description: 'Endereço de destino bloqueado.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Sucesso',
      description: `${cart.length} itens movidos para ${dest.code}`,
      className: 'bg-emerald-600 text-white',
    })
    setCart([])
    setDestCode('')
    setStep('SOURCE')
  }

  // --- Sub-renderers based on step ---

  if (step === 'SOURCE') {
    return (
      <div className="max-w-md mx-auto animate-fade-in mt-10">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin /> Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSourceSubmit} className="space-y-4">
              <label className="text-sm font-medium">Escanear Endereço de Origem</label>
              <Input
                ref={inputRef}
                placeholder="A-01-01"
                className="h-16 text-2xl text-center uppercase"
                autoFocus
              />
              <Button type="submit" className="w-full h-12 text-lg">
                Próximo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'PRODUCT') {
    const availableBalances = MOCK_BALANCES.filter((b) => b.addressId === sourceAddress?.id)
    return (
      <div className="max-w-md mx-auto animate-slide-up mt-10">
        <Button variant="ghost" onClick={() => setStep('SOURCE')} className="mb-4">
          &larr; Trocar Origem
        </Button>
        <h2 className="text-xl font-bold mb-4">Itens em {sourceAddress?.code}</h2>
        <div className="space-y-3">
          {availableBalances.length === 0 ? (
            <p className="text-muted-foreground">Endereço vazio.</p>
          ) : (
            availableBalances.map((b) => {
              const p = MOCK_PRODUCTS.find((x) => x.id === b.productId)!
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:border-primary"
                  onClick={() => handleProductSubmit(p.sku)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{p.sku}</p>
                      <p className="text-sm text-muted-foreground truncate">{p.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{b.qty}</p>
                      <p className="text-xs">{p.uom}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  if (step === 'QTY') {
    return (
      <div className="max-w-md mx-auto animate-slide-up mt-10">
        <Button variant="ghost" onClick={() => setStep('PRODUCT')} className="mb-4">
          &larr; Voltar
        </Button>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">{selectedProduct?.product.name}</p>
              <p className="text-3xl font-bold my-2">{selectedProduct?.product.sku}</p>
              <p className="text-sm text-amber-600 font-medium">
                Máximo disponível: {selectedProduct?.maxQty}
              </p>
            </div>
            <form onSubmit={handleQtySubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  className="h-16 text-3xl text-center"
                  autoFocus
                  step="0.01"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-16 px-6"
                  onClick={() => setQtyInput(selectedProduct!.maxQty.toString())}
                >
                  Max
                </Button>
              </div>
              <Button type="submit" className="w-full h-12 text-lg">
                Adicionar ao Carrinho
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'CART_REVIEW') {
    return (
      <div className="max-w-md mx-auto animate-fade-in mt-10 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart /> Carrinho Virtual
          </h2>
          <Button variant="outline" size="sm" onClick={() => setStep('SOURCE')}>
            + Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          {cart.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{c.product.sku}</p>
                  <p className="text-xs text-muted-foreground">De: {c.source.code}</p>
                </div>
                <div className="text-lg font-bold">
                  {c.qty}{' '}
                  <span className="text-sm font-normal text-muted-foreground">{c.product.uom}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-full h-14 text-lg" onClick={() => setStep('DESTINATION')}>
          Prosseguir para Destino <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    )
  }

  if (step === 'DESTINATION') {
    return (
      <div className="max-w-md mx-auto animate-slide-up mt-10">
        <Button variant="ghost" onClick={() => setStep('CART_REVIEW')} className="mb-4">
          &larr; Voltar ao Carrinho
        </Button>
        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <Scan /> Escanear Destino Final
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-sm text-center mb-4">Movendo {cart.length} item(s)</div>
            <form onSubmit={handleDestSubmit} className="space-y-4">
              <Input
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                placeholder="A-01-02"
                className="h-16 text-2xl text-center uppercase animate-scan-pulse"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                disabled={!destCode}
              >
                Confirmar Transferência
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
