import { useAppStore } from '@/stores/use-app-store'
import { MOCK_BRANCHES, MOCK_WAREHOUSES } from '@/lib/mock-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Building2, Warehouse as WarehouseIcon } from 'lucide-react'

export function ContextSwitcher() {
  const { activeBranch, setActiveBranch, activeWarehouse, setActiveWarehouse } = useAppStore()

  const handleBranchChange = (val: string) => {
    const branch = MOCK_BRANCHES.find((b) => b.id === val) || null
    setActiveBranch(branch)
    setActiveWarehouse(null)
  }

  const handleWarehouseChange = (val: string) => {
    const warehouse = MOCK_WAREHOUSES.find((w) => w.id === val) || null
    setActiveWarehouse(warehouse)
  }

  const availableWarehouses = MOCK_WAREHOUSES.filter((w) => w.branchId === activeBranch?.id)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-secondary/10 p-4 rounded-lg border border-border">
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Building2 className="w-3 h-3" /> Filial Operacional
        </Label>
        <Select value={activeBranch?.id || ''} onValueChange={handleBranchChange}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background">
            <SelectValue placeholder="Selecione a Filial" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_BRANCHES.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <WarehouseIcon className="w-3 h-3" /> Armazém
        </Label>
        <Select
          value={activeWarehouse?.id || ''}
          onValueChange={handleWarehouseChange}
          disabled={!activeBranch}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-background">
            <SelectValue placeholder="Selecione o Armazém" />
          </SelectTrigger>
          <SelectContent>
            {availableWarehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
