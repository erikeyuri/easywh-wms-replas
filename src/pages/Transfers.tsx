import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { ScanLine, Minus, Plus, ShoppingCart, ArrowRight, Settings2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type CartItem = {
  balance_id: string
  product_id: string
  product_sku: string
  product_desc: string
  batch: string
  available: number
  quantity: number
  origin_address_id: string
}

export default function TransfersPage() {
  const [companyId, setCompanyId] = useState(localStorage.getItem('wms_company') || '')
  const [warehouseId, setWarehouseId] = useState(localStorage.getItem('wms_warehouse') || '')
  const [companyName, setCompanyName] = useState(localStorage.getItem('wms_company_name') || '')
  const [warehouseName, setWarehouseName] = useState(
    localStorage.getItem('wms_warehouse_name') || '',
  )
  const [showContext, setShowContext] = useState(!companyId || !warehouseId)

  const [companies, setCompanies] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])

  const [step, setStep] = useState(1)
  const [origin, setOrigin] = useState('')
  const [originAddress, setOriginAddress] = useState<any>(null)
  const [originBalances, setOriginBalances] = useState<any[]>([])

  const [cart, setCart] = useState<CartItem[]>([])
  const [cartBarcode, setCartBarcode] = useState('')

  const [dest, setDest] = useState('')
  const [destAddress, setDestAddress] = useState<any>(null)

  const [loading, setLoading] = useState(false)
  const [errorFlash, setErrorFlash] = useState(false)
  const { toast } = useToast()

  const originRef = useRef<HTMLInputElement>(null)
  const cartInputRef = useRef<HTMLInputElement>(null)
  const destRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pb.collection('companies').getFullList().then(setCompanies)
    pb.collection('warehouses').getFullList().then(setWarehouses)
  }, [])

  useEffect(() => {
    if (!showContext) {
      if (step === 1) setTimeout(() => originRef.current?.focus(), 100)
      if (step === 2) setTimeout(() => cartInputRef.current?.focus(), 100)
      if (step === 3) setTimeout(() => destRef.current?.focus(), 100)
    }
  }, [step, showContext])

  const handleSaveContext = () => {
    const comp = companies.find((c) => c.id === companyId)
    const ware = warehouses.find((w) => w.id === warehouseId)
    localStorage.setItem('wms_company', companyId)
    localStorage.setItem('wms_warehouse', warehouseId)
    localStorage.setItem('wms_company_name', comp?.name || '')
    localStorage.setItem('wms_warehouse_name', ware?.description || '')
    setCompanyName(comp?.name || '')
    setWarehouseName(ware?.description || '')
    setShowContext(false)
  }

  const triggerError = () => {
    setErrorFlash(true)
    setTimeout(() => setErrorFlash(false), 300)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      osc.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      /* intentionally ignored */
    }
  }

  const searchOrigin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!origin) return
    setLoading(true)
    try {
      const addr = await pb
        .collection('addresses')
        .getFirstListItem(`code='${origin}'`, { expand: 'zoneId' })
      if (addr.expand?.zoneId?.warehouseId !== warehouseId) {
        toast({ variant: 'destructive', description: 'Endereço não pertence ao armazém atual.' })
        triggerError()
      } else {
        const bals = await pb.collection('balances').getFullList({
          filter: `address_id='${addr.id}' && quantity_available > 0`,
          expand: 'product_id',
        })
        if (bals.length === 0) {
          toast({ variant: 'destructive', description: 'Endereço vazio.' })
          triggerError()
        } else {
          setOriginBalances(bals)
          setOriginAddress(addr)
          setStep(2)
        }
      }
    } catch {
      toast({ variant: 'destructive', description: 'Endereço origem não encontrado.' })
      triggerError()
    }
    setLoading(false)
  }

  const handleCartScan = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!cartBarcode) return
    const match = originBalances.find(
      (b) =>
        b.expand?.product_id?.sku === cartBarcode ||
        b.expand?.product_id?.barcode === cartBarcode ||
        b.batch === cartBarcode,
    )
    if (!match) {
      toast({ variant: 'destructive', description: 'Item não encontrado neste endereço.' })
      triggerError()
    } else {
      addToCart(match)
    }
    setCartBarcode('')
    cartInputRef.current?.focus()
  }

  const addToCart = (match: any) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.balance_id === match.id)
      if (exists) {
        return prev.map((p) =>
          p.balance_id === match.id ? { ...p, quantity: Math.min(p.quantity + 1, p.available) } : p,
        )
      }
      return [
        ...prev,
        {
          balance_id: match.id,
          product_id: match.product_id,
          product_sku: match.expand?.product_id?.sku,
          product_desc: match.expand?.product_id?.description,
          batch: match.batch,
          available: match.quantity_available,
          quantity: 1,
          origin_address_id: match.address_id,
        },
      ]
    })
  }

  const updateQty = (id: string, qty: number) => {
    setCart((prev) => prev.map((p) => (p.balance_id === id ? { ...p, quantity: qty } : p)))
  }

  const searchDest = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!dest) return
    setLoading(true)
    try {
      const addr = await pb.collection('addresses').getFirstListItem(`code='${dest}'`)
      if (addr.lockStatus === 'Bloqueado Entrada' || addr.lockStatus === 'Bloqueado Total') {
        toast({ variant: 'destructive', description: `O endereço ${dest} está bloqueado.` })
        triggerError()
      } else {
        setDestAddress(addr)
        setStep(4)
      }
    } catch {
      toast({ variant: 'destructive', description: 'Endereço destino não encontrado.' })
      triggerError()
    }
    setLoading(false)
  }

  const confirmTransfer = async () => {
    setLoading(true)
    try {
      const itemsPayload = cart.map((c) => ({
        balance_id: c.balance_id,
        product_id: c.product_id,
        origin_address_id: c.origin_address_id,
        destination_address_id: destAddress.id,
        quantity: c.quantity,
        batch: c.batch,
      }))
      await pb.send('/backend/v1/transfer-cart', {
        method: 'POST',
        body: JSON.stringify({ items: itemsPayload }),
      })
      toast({ title: 'Sucesso', description: `${cart.length} itens transferidos.` })
      setStep(1)
      setOrigin('')
      setOriginAddress(null)
      setOriginBalances([])
      setCart([])
      setCartBarcode('')
      setDest('')
      setDestAddress(null)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
    setLoading(false)
  }

  if (showContext) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-center">Configurar Contexto</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Empresa / Filial</Label>
              <select
                className="flex h-14 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Armazém</Label>
              <select
                className="flex h-14 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {warehouses
                  .filter((w) => w.companyId === companyId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.description}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              className="w-full h-14 text-lg mt-4"
              disabled={!companyId || !warehouseId}
              onClick={handleSaveContext}
            >
              Confirmar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'max-w-xl mx-auto p-4 space-y-4 transition-colors duration-300 min-h-screen',
        errorFlash && 'bg-destructive/10',
      )}
    >
      <div className="bg-primary text-primary-foreground p-4 rounded-lg flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs opacity-80">Contexto Ativo</p>
          <p className="font-bold truncate max-w-[200px] sm:max-w-xs">
            {companyName} - {warehouseName}
          </p>
        </div>
        <Button variant="secondary" size="icon" onClick={() => setShowContext(true)}>
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-2 items-center justify-center text-sm font-medium text-muted-foreground pb-2 flex-wrap">
        <span className={step >= 1 ? 'text-primary' : ''}>Origem</span>{' '}
        <ArrowRight className="w-4 h-4 shrink-0" />
        <span className={step >= 2 ? 'text-primary' : ''}>Carrinho</span>{' '}
        <ArrowRight className="w-4 h-4 shrink-0" />
        <span className={step >= 3 ? 'text-primary' : ''}>Destino</span>{' '}
        <ArrowRight className="w-4 h-4 shrink-0" />
        <span className={step >= 4 ? 'text-primary' : ''}>Confirmar</span>
      </div>

      {step === 1 && (
        <form onSubmit={searchOrigin} className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
          <Label className="text-lg">Ler Endereço de Origem</Label>
          <div className="flex gap-2">
            <Input
              ref={originRef}
              className="h-14 text-xl uppercase"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              placeholder="01-01-A-01"
              autoFocus
            />
            <Button type="button" variant="secondary" className="h-14 w-14 shrink-0">
              <ScanLine className="w-6 h-6" />
            </Button>
          </div>
          <Button type="submit" className="w-full h-14 text-lg" disabled={!origin || loading}>
            Avançar
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <form
            onSubmit={handleCartScan}
            className="bg-card p-4 rounded-lg border shadow-sm space-y-4"
          >
            <Label className="text-lg">Ler Produto ou Lote</Label>
            <div className="flex gap-2">
              <Input
                ref={cartInputRef}
                className="h-14 text-xl uppercase"
                value={cartBarcode}
                onChange={(e) => setCartBarcode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE BARRAS"
                autoFocus
              />
              <Button type="submit" variant="secondary" className="h-14 w-14 shrink-0">
                <ScanLine className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {originBalances.map((b) => (
                <Button
                  key={b.id}
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => addToCart(b)}
                >
                  + {b.expand?.product_id?.sku}
                </Button>
              ))}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Itens Coletados ({cart.length})
            </h3>
            {cart.map((item) => (
              <div
                key={item.balance_id}
                className="border-2 border-border p-4 rounded-xl bg-card shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">{item.product_sku}</p>
                    <p className="text-sm text-muted-foreground">{item.product_desc}</p>
                    <p className="text-sm font-medium mt-1">
                      Lote:{' '}
                      <span className="bg-secondary/20 px-2 py-0.5 rounded">
                        {item.batch || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="font-bold text-xl text-primary">{item.available}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    variant="outline"
                    onClick={() => updateQty(item.balance_id, Math.max(0, item.quantity - 1))}
                  >
                    <Minus />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="h-12 text-center text-xl font-bold min-w-[3rem]"
                    value={item.quantity || ''}
                    onChange={(e) => updateQty(item.balance_id, Number(e.target.value))}
                  />
                  <Button
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    variant="outline"
                    onClick={() =>
                      updateQty(item.balance_id, Math.min(item.available, item.quantity + 1))
                    }
                  >
                    <Plus />
                  </Button>
                  <Button
                    className="h-12 px-2 sm:px-4 shrink-0 font-bold"
                    variant="secondary"
                    onClick={() => updateQty(item.balance_id, item.available)}
                  >
                    MAX
                  </Button>
                  <Button
                    size="icon"
                    className="h-12 w-12 shrink-0 ml-auto"
                    variant="destructive"
                    onClick={() =>
                      setCart((p) => p.filter((x) => x.balance_id !== item.balance_id))
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="w-1/3 h-14" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              className="w-2/3 h-14 text-lg"
              onClick={() => setStep(3)}
              disabled={
                cart.length === 0 || cart.some((c) => c.quantity <= 0 || c.quantity > c.available)
              }
            >
              Avançar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={searchDest} className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
          <Label className="text-lg">Ler Endereço de Destino</Label>
          <div className="flex gap-2">
            <Input
              ref={destRef}
              className="h-14 text-xl uppercase"
              value={dest}
              onChange={(e) => setDest(e.target.value.toUpperCase())}
              placeholder="Ex: 99-99-Z-99"
              autoFocus
            />
            <Button type="button" variant="secondary" className="h-14 w-14 shrink-0">
              <ScanLine className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/3 h-14"
              onClick={() => setStep(2)}
            >
              Voltar
            </Button>
            <Button type="submit" className="w-2/3 h-14 text-lg" disabled={!dest || loading}>
              Revisar
            </Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Resumo da Transferência</h2>
          <div className="bg-muted p-4 rounded-md space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Origem:</span>
              <span className="font-bold text-lg">{originAddress?.code}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2">
              <span className="text-muted-foreground text-sm">Destino:</span>
              <span className="font-bold text-lg text-primary">{destAddress?.code}</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-bold border-b pb-2">Itens no Carrinho ({cart.length})</p>
            {cart.map((c) => (
              <div key={c.balance_id} className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{c.product_sku}</p>
                  <p className="text-xs text-muted-foreground">Lote: {c.batch || 'N/A'}</p>
                </div>
                <p className="font-bold text-lg px-3 py-1 bg-secondary/20 rounded">
                  {c.quantity} un
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-6">
            <Button variant="outline" className="w-1/3 h-14" onClick={() => setStep(3)}>
              Voltar
            </Button>
            <Button className="w-2/3 h-14 text-lg" onClick={confirmTransfer} disabled={loading}>
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
