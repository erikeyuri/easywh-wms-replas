import { useState } from 'react'
import { MOCK_BALANCES, MOCK_ADDRESSES, MOCK_PRODUCTS } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Box } from 'lucide-react'

export default function SaldosPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const balancesWithDetails = MOCK_BALANCES.map((bal) => {
    const address = MOCK_ADDRESSES.find((a) => a.id === bal.addressId)
    const product = MOCK_PRODUCTS.find((p) => p.id === bal.productId)
    return { ...bal, address, product }
  }).filter(
    (b) =>
      b.address?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.product?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Consulta de Saldos</h1>
        <p className="text-muted-foreground text-sm">
          Verifique o estoque atual por endereço ou produto.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filtros Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Escanear ou digitar Endereço, SKU ou Descrição..."
              className="pl-10 h-12 text-lg border-2 focus-visible:ring-primary focus-visible:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balancesWithDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum saldo encontrado para a pesquisa.
                  </TableCell>
                </TableRow>
              ) : (
                balancesWithDetails.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {b.address?.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-1">
                          <Box className="w-3 h-3" /> {b.product?.sku}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {b.product?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{b.lot || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {b.qty}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        {b.product?.uom}
                      </span>
                    </TableCell>
                    <TableCell>
                      {b.address?.zone === 'Recebimento' ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          A endereçar
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Endereçado
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
