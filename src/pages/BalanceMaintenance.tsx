import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BalanceMaintenancePage() {
  const [products, setProducts] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const { toast } = useToast()
  const { user } = useAuth()
  const [operator, setOperator] = useState<any>(null)

  // Tab 1: Incluir
  const [productId, setProductId] = useState('')
  const [destType, setDestType] = useState('unaddressed')
  const [addressId, setAddressId] = useState('')
  const [batch, setBatch] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isSubmittingIn, setIsSubmittingIn] = useState(false)

  // Tab 2: Baixar
  const [locType, setLocType] = useState('unaddressed')
  const [locAddressId, setLocAddressId] = useState('')
  const [balancesList, setBalancesList] = useState<any[]>([])
  const [selectedBalanceId, setSelectedBalanceId] = useState('')
  const [removeQty, setRemoveQty] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmittingOut, setIsSubmittingOut] = useState(false)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)

  useEffect(() => {
    Promise.all([
      pb.collection('products').getFullList({ sort: 'sku' }),
      pb.collection('addresses').getFullList({ sort: 'code' }),
    ]).then(([prods, addrs]) => {
      setProducts(prods)
      setAddresses(addrs)
    })
  }, [])

  useEffect(() => {
    if (user?.name) {
      pb.collection('operators')
        .getFirstListItem(`name~"${user.name}"`)
        .then((op) => setOperator(op))
        .catch(() => {})
    }
  }, [user])

  const loadLocBalances = async () => {
    if (locType === 'addressed' && !locAddressId) {
      setBalancesList([])
      setSelectedBalanceId('')
      return
    }

    setIsLoadingBalances(true)
    const addrFilter = locType === 'addressed' ? `address_id="${locAddressId}"` : `address_id=""`

    try {
      const list = await pb.collection('balances').getFullList({
        filter: `${addrFilter} && quantity_available > 0`,
        expand: 'product_id,address_id',
      })
      setBalancesList(list)
      setSelectedBalanceId('')
    } catch {
      setBalancesList([])
      setSelectedBalanceId('')
    } finally {
      setIsLoadingBalances(false)
    }
  }

  useEffect(() => {
    loadLocBalances()
  }, [locType, locAddressId])

  const handleIncluir = async () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha produto e quantidade válida.',
        variant: 'destructive',
      })
      return
    }
    if (destType === 'addressed' && !addressId) {
      toast({ title: 'Erro', description: 'Selecione um endereço.', variant: 'destructive' })
      return
    }

    setIsSubmittingIn(true)
    try {
      const addr = destType === 'addressed' ? addressId : ''
      const batchFilter = batch ? ` && batch="${batch}"` : ` && batch=""`
      const addrFilter = addr ? ` && address_id="${addr}"` : ` && address_id=""`
      const filter = `product_id="${productId}"${batchFilter}${addrFilter}`

      let existing: any = null
      try {
        existing = await pb.collection('balances').getFirstListItem(filter)
      } catch {
        /* intentionally ignored */
      }

      if (existing) {
        await pb.collection('balances').update(existing.id, {
          quantity_available: existing.quantity_available + Number(quantity),
        })
      } else {
        await pb.collection('balances').create({
          product_id: productId,
          address_id: addr || null,
          batch,
          expiry_date: expiryDate || null,
          quantity_available: Number(quantity),
          quantity_reserved: 0,
        })
      }

      const addrObj = addr ? addresses.find((a) => a.id === addr) : null

      await pb.collection('movements').create({
        product_id: productId,
        destination_address: addrObj ? addrObj.code : 'Saldo a Endereçar',
        quantity: Number(quantity),
        batch,
        type: 'adjust_in',
        operator_id: operator?.id || null,
      })

      toast({ title: 'Sucesso', description: 'Saldo incluído com sucesso.' })
      setProductId('')
      setAddressId('')
      setBatch('')
      setExpiryDate('')
      setQuantity('')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao incluir saldo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingIn(false)
    }
  }

  const handleBaixar = async () => {
    if (!selectedBalanceId || !removeQty || Number(removeQty) <= 0 || !reason) {
      toast({
        title: 'Erro',
        description: 'Preencha saldo, quantidade válida e motivo.',
        variant: 'destructive',
      })
      return
    }

    const balance = balancesList.find((b) => b.id === selectedBalanceId)
    if (!balance) return

    if (Number(removeQty) > balance.quantity_available) {
      toast({
        title: 'Erro',
        description: 'Saldo insuficiente para esta operação.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmittingOut(true)
    try {
      await pb.collection('balances').update(balance.id, {
        quantity_available: balance.quantity_available - Number(removeQty),
      })

      await pb.collection('movements').create({
        product_id: balance.product_id,
        origin_address: balance.expand?.address_id?.code || 'Saldo a Endereçar',
        quantity: Number(removeQty),
        batch: balance.batch,
        type: 'adjust_out',
        source_doc: reason,
        operator_id: operator?.id || null,
      })

      toast({ title: 'Sucesso', description: 'Saldo baixado com sucesso.' })
      await loadLocBalances()
      setRemoveQty('')
      setReason('')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao baixar saldo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingOut(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manutenção de Saldos</h2>
      </div>

      <Tabs defaultValue="include" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="include">Incluir Saldo</TabsTrigger>
          <TabsTrigger value="remove">Baixar Saldo</TabsTrigger>
        </TabsList>

        <TabsContent value="include">
          <Card>
            <CardHeader>
              <CardTitle>Incluir Saldo (Adjust In)</CardTitle>
              <CardDescription>
                Adicione estoque ao inventário informando o destino manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Produto</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.sku} - {p.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Destino</Label>
                <RadioGroup
                  value={destType}
                  onValueChange={setDestType}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unaddressed" id="dest-un" />
                    <Label htmlFor="dest-un">Saldo a Endereçar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="addressed" id="dest-add" />
                    <Label htmlFor="dest-add">Endereço Definido</Label>
                  </div>
                </RadioGroup>
              </div>

              {destType === 'addressed' && (
                <div className="space-y-3">
                  <Label>Endereço</Label>
                  <Select value={addressId} onValueChange={setAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um endereço..." />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Lote</Label>
                  <Input
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Validade</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 100"
                />
              </div>

              <Button onClick={handleIncluir} disabled={isSubmittingIn} className="w-full">
                {isSubmittingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Inclusão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remove">
          <Card>
            <CardHeader>
              <CardTitle>Baixar Saldo (Adjust Out)</CardTitle>
              <CardDescription>
                Reduza o estoque informando o local e um motivo obrigatório.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Local de Origem</Label>
                <RadioGroup
                  value={locType}
                  onValueChange={setLocType}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unaddressed" id="loc-un" />
                    <Label htmlFor="loc-un">Saldo a Endereçar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="addressed" id="loc-add" />
                    <Label htmlFor="loc-add">Endereço Definido</Label>
                  </div>
                </RadioGroup>
              </div>

              {locType === 'addressed' && (
                <div className="space-y-3">
                  <Label>Endereço</Label>
                  <Select value={locAddressId} onValueChange={setLocAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um endereço..." />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <Label>Saldo Disponível</Label>
                <div className="border rounded-md">
                  {isLoadingBalances ? (
                    <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Carregando saldos...
                    </div>
                  ) : balancesList.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Nenhum saldo encontrado neste local.
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px] w-full">
                      <div className="divide-y">
                        {balancesList.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 flex items-center gap-4 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedBalanceId(b.id)}
                          >
                            <RadioGroup value={selectedBalanceId}>
                              <div className="flex items-center">
                                <RadioGroupItem
                                  value={b.id}
                                  id={`bal-${b.id}`}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center ${selectedBalanceId === b.id ? 'bg-primary' : ''}`}
                                >
                                  {selectedBalanceId === b.id && (
                                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                  )}
                                </div>
                              </div>
                            </RadioGroup>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {b.expand?.product_id?.sku} - {b.expand?.product_id?.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Lote: {b.batch || '-'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm text-green-600">
                                {b.quantity_available} un
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Qtd a Baixar</Label>
                  <Input
                    type="number"
                    min="1"
                    value={removeQty}
                    onChange={(e) => setRemoveQty(e.target.value)}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="space-y-3">
                  <Label>
                    Motivo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Quebra, Vencimento..."
                  />
                </div>
              </div>

              <Button
                onClick={handleBaixar}
                variant="destructive"
                className="w-full"
                disabled={!selectedBalanceId || isSubmittingOut}
              >
                {isSubmittingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Baixa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
