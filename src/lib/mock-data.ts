export type Branch = { id: string; name: string }
export type Warehouse = { id: string; branchId: string; name: string }
export type Product = { id: string; sku: string; name: string; uom: string }
export type Address = {
  id: string
  code: string
  zone: string
  status: 'free' | 'occupied' | 'locked'
}
export type Balance = {
  id: string
  addressId: string
  productId: string
  qty: number
  lot?: string
}

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Matriz - SP' },
  { id: 'b2', name: 'Filial - RJ' },
]

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', branchId: 'b1', name: 'CD Principal' },
  { id: 'w2', branchId: 'b1', name: 'CD Secundário' },
  { id: 'w3', branchId: 'b2', name: 'Armazém Litoral' },
]

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'SKU-001', name: 'Parafuso Sextavado M8', uom: 'CX' },
  { id: 'p2', sku: 'SKU-002', name: 'Porca M8 Galvanizada', uom: 'PC' },
  { id: 'p3', sku: 'SKU-003', name: 'Fita Isolante 3M', uom: 'UN' },
  { id: 'p4', sku: 'SKU-004', name: 'Luva de Proteção CA', uom: 'PR' },
]

export const MOCK_ADDRESSES: Address[] = [
  { id: 'a1', code: 'A-01-01', zone: 'Picking', status: 'occupied' },
  { id: 'a2', code: 'A-01-02', zone: 'Picking', status: 'free' },
  { id: 'a3', code: 'B-10-05', zone: 'Reserva', status: 'occupied' },
  { id: 'a4', code: 'B-10-06', zone: 'Reserva', status: 'locked' },
  { id: 'a5', code: 'DOCA-01', zone: 'Recebimento', status: 'occupied' },
]

export let MOCK_BALANCES: Balance[] = [
  { id: 'bal1', addressId: 'a1', productId: 'p1', qty: 150, lot: 'L2309' },
  { id: 'bal2', addressId: 'a3', productId: 'p3', qty: 500 },
  { id: 'bal3', addressId: 'a5', productId: 'p4', qty: 120 }, // Pending putaway
]

export const updateBalance = (newBalances: Balance[]) => {
  MOCK_BALANCES = newBalances
}
