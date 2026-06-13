import { useEffect, useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const getVal = (i: any, k: string) => {
  const zone = i.expand?.address_id?.expand?.zoneId
  const wh = zone?.expand?.warehouseId
  const co = wh?.expand?.companyId
  const p = i.expand?.product_id

  if (k === 'branch') return co?.code || ''
  if (k === 'wh') return wh?.code || ''
  if (k === 'zone') return zone?.code || ''
  if (k === 'addr') return i.expand?.address_id?.code || ''
  if (k === 'sku') return p?.sku || ''
  if (k === 'desc') return p?.description || ''
  if (k === 'qty') return i.quantity_available || 0
  if (k === 'status') {
    if (i.quantity_reserved > 0) return 'reservado'
    if (i.quantity_available > 0) return 'disponivel'
    return 'sem_saldo'
  }
  return i[k] || ''
}

export default function BalancesPage() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [fBranch, setFBranch] = useState('all')
  const [fWh, setFWh] = useState('all')
  const [fZone, setFZone] = useState('all')
  const [fAddr, setFAddr] = useState('all')
  const [sort, setSort] = useState({ key: 'qty', dir: 'desc' })
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const loadData = async () => {
    const res = await pb
      .collection('balances')
      .getFullList({ expand: 'product_id,address_id.zoneId.warehouseId.companyId' })
    setData(res)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('balances', () => {
    loadData()
  })

  const uniqueBranches = useMemo(
    () => Array.from(new Set(data.map((d) => getVal(d, 'branch')).filter(Boolean))).sort(),
    [data],
  )
  const uniqueWhs = useMemo(
    () => Array.from(new Set(data.map((d) => getVal(d, 'wh')).filter(Boolean))).sort(),
    [data],
  )
  const uniqueZones = useMemo(
    () => Array.from(new Set(data.map((d) => getVal(d, 'zone')).filter(Boolean))).sort(),
    [data],
  )
  const uniqueAddrs = useMemo(
    () => Array.from(new Set(data.map((d) => getVal(d, 'addr')).filter(Boolean))).sort(),
    [data],
  )

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        if (status === 'addressed' && !item.address_id) return false
        if (status === 'unaddressed' && item.address_id) return false
        if (fBranch !== 'all' && getVal(item, 'branch') !== fBranch) return false
        if (fWh !== 'all' && getVal(item, 'wh') !== fWh) return false
        if (fZone !== 'all' && getVal(item, 'zone') !== fZone) return false
        if (fAddr !== 'all' && getVal(item, 'addr') !== fAddr) return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !getVal(item, 'sku').toLowerCase().includes(q) &&
            !getVal(item, 'desc').toLowerCase().includes(q) &&
            !(item.batch || '').toLowerCase().includes(q)
          )
            return false
        }
        return true
      })
      .sort((a, b) => {
        let va = getVal(a, sort.key)
        let vb = getVal(b, sort.key)

        if (typeof va === 'string' && typeof vb === 'string') {
          return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        }

        if (va < vb) return sort.dir === 'asc' ? -1 : 1
        if (va > vb) return sort.dir === 'asc' ? 1 : -1
        return 0
      })
  }, [data, search, status, fBranch, fWh, fZone, fAddr, sort])

  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalQty = filteredData.reduce((acc, i) => acc + (i.quantity_available || 0), 0)

  const handleExport = () => {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Saldos">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Filial</Data></Cell>
    <Cell><Data ss:Type="String">Armazém</Data></Cell>
    <Cell><Data ss:Type="String">Endereço</Data></Cell>
    <Cell><Data ss:Type="String">Produto</Data></Cell>
    <Cell><Data ss:Type="String">Lote</Data></Cell>
    <Cell><Data ss:Type="String">Validade</Data></Cell>
    <Cell><Data ss:Type="String">Qtd Disponível</Data></Cell>
   </Row>`

    const escapeXml = (unsafe: string) =>
      unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<':
            return '&lt;'
          case '>':
            return '&gt;'
          case '&':
            return '&amp;'
          case "'":
            return '&apos;'
          case '"':
            return '&quot;'
          default:
            return c
        }
      })

    filteredData.forEach((i) => {
      const filial = escapeXml(getVal(i, 'branch'))
      const armazem = escapeXml(getVal(i, 'wh'))
      const endereco = escapeXml(getVal(i, 'addr') || 'A Endereçar')
      const produto = escapeXml(`${getVal(i, 'sku')} - ${getVal(i, 'desc')}`)
      const lote = escapeXml(i.batch || '')
      const validade = i.expiry_date ? new Date(i.expiry_date).toLocaleDateString('pt-BR') : ''
      const qtd = i.quantity_available || 0

      xml += `
   <Row>
    <Cell><Data ss:Type="String">${filial}</Data></Cell>
    <Cell><Data ss:Type="String">${armazem}</Data></Cell>
    <Cell><Data ss:Type="String">${endereco}</Data></Cell>
    <Cell><Data ss:Type="String">${produto}</Data></Cell>
    <Cell><Data ss:Type="String">${lote}</Data></Cell>
    <Cell><Data ss:Type="String">${validade}</Data></Cell>
    <Cell><Data ss:Type="Number">${qtd}</Data></Cell>
   </Row>`
    })

    xml += `
  </Table>
 </Worksheet>
</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saldos_${new Date().getTime()}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  const th = (label: string, key: string, rightAlign = false) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap hover:bg-gray-100 transition-colors"
      onClick={() => setSort({ key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' })}
    >
      <div className={`flex items-center gap-1.5 ${rightAlign ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown
          className={cn('w-3 h-3', sort.key === key ? 'text-primary' : 'text-muted-foreground/50')}
        />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6 bg-slate-50/50 p-2 sm:p-4 rounded-lg min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Consulta de Saldos</h2>
        <Button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar XLS
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 border rounded-md shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto ou lote..."
              className="pl-9 bg-slate-50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white">
                <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
                {(fBranch !== 'all' || fWh !== 'all' || fZone !== 'all' || fAddr !== 'all') && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full"
                  >
                    {[fBranch, fWh, fZone, fAddr].filter((f) => f !== 'all').length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-4" align="start">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Filtros de Localização</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFBranch('all')
                      setFWh('all')
                      setFZone('all')
                      setFAddr('all')
                      setPage(1)
                    }}
                  >
                    Limpar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Filial</label>
                    <Select value={fBranch} onValueChange={setFBranch}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {uniqueBranches.map((o: string) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Armazém</label>
                    <Select value={fWh} onValueChange={setFWh}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueWhs.map((o: string) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Zona</label>
                    <Select value={fZone} onValueChange={setFZone}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {uniqueZones.map((o: string) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Endereço</label>
                    <Select value={fAddr} onValueChange={setFAddr}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueAddrs.map((o: string) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          className="w-full xl:w-[400px]"
        >
          <TabsList className="w-full h-10 p-1 bg-slate-100">
            <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            <TabsTrigger value="addressed" className="flex-1 text-xs sm:text-sm">
              Endereçados
            </TabsTrigger>
            <TabsTrigger value="unaddressed" className="flex-1 text-xs sm:text-sm">
              A Endereçar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                {th('Filial', 'branch')}
                {th('Armazém', 'wh')}
                {th('Endereço', 'addr')}
                {th('Produto', 'sku')}
                {th('Lote', 'batch')}
                {th('Validade', 'expiry_date')}
                {th('Status', 'status')}
                {th('Qtd Disponível', 'qty', true)}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-gray-300" />
                      <p>Nenhum saldo encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <TableCell className="font-mono text-gray-600">
                    {getVal(item, 'branch') || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-gray-600">
                    {getVal(item, 'wh') || '-'}
                  </TableCell>
                  <TableCell>
                    {getVal(item, 'addr') ? (
                      <span className="font-medium font-mono text-gray-800">
                        {getVal(item, 'addr')}
                      </span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-800 border-yellow-200"
                      >
                        A Endereçar
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-md hidden sm:flex border border-primary/10">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col max-w-[200px] sm:max-w-[280px]">
                        <span className="font-bold text-gray-900 text-sm">
                          {getVal(item, 'sku')}
                        </span>
                        <span
                          className="text-xs text-gray-500 truncate"
                          title={getVal(item, 'desc')}
                        >
                          {getVal(item, 'desc')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 font-mono text-sm">
                    {item.batch || '-'}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.quantity_reserved > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 shadow-none font-medium text-xs px-2 py-0.5 whitespace-nowrap">
                        Reservado ({item.quantity_reserved})
                      </Badge>
                    ) : item.quantity_available > 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 shadow-none font-medium text-xs px-2 py-0.5 whitespace-nowrap">
                        Disponível
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200 shadow-none font-medium text-xs px-2 py-0.5 whitespace-nowrap">
                        Sem Saldo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-gray-900 text-base">
                      {item.quantity_available || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes do Produto</DropdownMenuItem>
                        <DropdownMenuItem>Histórico de Movimentações</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {paginatedData.length > 0 && (
              <TableFooter className="bg-slate-50 border-t border-slate-200">
                <TableRow className="hover:bg-slate-50">
                  <TableCell colSpan={7} className="text-right text-sm font-medium text-slate-600">
                    Total Qtd Disponível na Seleção:
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold text-primary">{totalQty}</span>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <div className="border-t bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1 font-medium">
              Mostrando {Math.min((page - 1) * itemsPerPage + 1, filteredData.length)}-
              {Math.min(page * itemsPerPage, filteredData.length)} de {filteredData.length} itens
            </div>
            <div className="flex items-center gap-6 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-white shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(Math.ceil(filteredData.length / itemsPerPage), p + 1))
                  }
                  disabled={
                    page >= Math.ceil(filteredData.length / itemsPerPage) ||
                    filteredData.length === 0
                  }
                  className="bg-white shadow-sm"
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
