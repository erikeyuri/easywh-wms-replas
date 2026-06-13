export const mockCompanies = [
  {
    id: '1',
    code: 'EMP01',
    branch: 'FL01',
    name: 'Logistics Matrix SP',
    status: 'Ativo',
    erp: 'ERP-101',
  },
  {
    id: '2',
    code: 'EMP01',
    branch: 'FL02',
    name: 'Logistics Matrix RJ',
    status: 'Ativo',
    erp: 'ERP-102',
  },
  {
    id: '3',
    code: 'EMP02',
    branch: 'FL01',
    name: 'Global Dist',
    status: 'Inativo',
    erp: 'ERP-201',
  },
]

export const mockWarehouses = [
  {
    id: '1',
    companyId: '1',
    code: 'ARM-SP-01',
    description: 'Armazém Principal SP',
    type: 'Real',
    status: 'Ativo',
    erp: 'WH-01',
  },
  {
    id: '2',
    companyId: '1',
    code: 'ARM-SP-02',
    description: 'Armazém Secundário SP',
    type: 'Virtual',
    status: 'Ativo',
    erp: 'WH-02',
  },
  {
    id: '3',
    companyId: '2',
    code: 'ARM-RJ-01',
    description: 'Armazém Central RJ',
    type: 'Real',
    status: 'Ativo',
    erp: 'WH-03',
  },
]

export const mockZones = [
  {
    id: '1',
    warehouseId: '1',
    code: 'Z-01',
    description: 'Zona de Picking A',
    type: 'Dinâmica',
    rule: 'FEFO',
    sequence: 10,
  },
  {
    id: '2',
    warehouseId: '1',
    code: 'Z-02',
    description: 'Pulmão Congelados',
    type: 'Blocada',
    rule: 'FIFO',
    sequence: 20,
  },
  {
    id: '3',
    warehouseId: '3',
    code: 'Z-10',
    description: 'Recepção Doca',
    type: 'Trânsito',
    rule: 'LIFO',
    sequence: 1,
  },
]

export const mockAddresses = [
  {
    id: '1',
    zoneId: '1',
    code: '01-01-A-01',
    type: 'Picking',
    maxVolume: 1.5,
    maxWeight: 1000,
    maxPallets: 1,
    status: 'Liberado',
    sequence: 1,
    abc: 'A',
    equipment: 'Transpaleteira',
  },
  {
    id: '2',
    zoneId: '1',
    code: '01-01-A-02',
    type: 'Picking',
    maxVolume: 1.5,
    maxWeight: 1000,
    maxPallets: 1,
    status: 'Liberado',
    sequence: 2,
    abc: 'A',
    equipment: 'Transpaleteira',
  },
  {
    id: '3',
    zoneId: '2',
    code: '99-01-Z-99',
    type: 'Pulmão',
    maxVolume: 3.0,
    maxWeight: 2000,
    maxPallets: 2,
    status: 'Bloqueado Total',
    sequence: 999,
    abc: 'C',
    equipment: 'Empilhadeira Retrátil',
  },
  {
    id: '4',
    zoneId: '1',
    code: '01-02-B-01',
    type: 'Picking',
    maxVolume: 1.0,
    maxWeight: 500,
    maxPallets: 1,
    status: 'Bloqueado Entrada',
    sequence: 3,
    abc: 'B',
    equipment: 'Manual',
  },
]

export const mockProducts = [
  {
    id: '1',
    sku: 'SKU-1001',
    description: 'Caixa Organizadora M',
    type: 'Embalagem',
    unit: 'UN',
    barcode: '789100000001',
    standardQty: 50,
  },
  {
    id: '2',
    sku: 'SKU-2044',
    description: 'Monitor LED 24"',
    type: 'Eletrônicos',
    unit: 'UN',
    barcode: '789100000002',
    standardQty: 10,
  },
  {
    id: '3',
    sku: 'SKU-8890',
    description: 'Cabo HDMI 2m',
    type: 'Acessórios',
    unit: 'UN',
    barcode: '789100000003',
    standardQty: 100,
  },
  {
    id: '4',
    sku: 'SKU-4402',
    description: 'Fita Adesiva Transparente',
    type: 'Insumo',
    unit: 'RL',
    barcode: '789100000004',
    standardQty: 200,
  },
]

export const mockActivities = [
  {
    id: '1',
    action: 'Novo Endereço cadastrado',
    target: '01-01-A-03 na Zona Z-01',
    time: 'Há 10 min',
  },
  {
    id: '2',
    action: 'Produto atualizado',
    target: 'SKU-2044 (Dimensões alteradas)',
    time: 'Há 45 min',
  },
  { id: '3', action: 'Armazém bloqueado', target: 'ARM-SP-02 (Manutenção)', time: 'Há 2 horas' },
  { id: '4', action: 'Nova Zona criada', target: 'Z-03 no Armazém ARM-SP-01', time: 'Ontem' },
  { id: '5', action: 'Filial adicionada', target: 'FL03 - Logistics Matrix MG', time: 'Ontem' },
]

export const companies = mockCompanies.map((c) => ({
  ...c,
  branchCode: c.branch,
  erpCode: c.erp,
}))

export const warehouses = mockWarehouses.map((w) => ({
  ...w,
  erpCode: w.erp,
}))

export const zones = mockZones.map((z) => ({
  ...z,
  supplySequence: z.sequence,
  allocationRule: z.rule,
}))

export const addresses = mockAddresses.map((a) => ({
  ...a,
  lockStatus: a.status,
  pickingSequence: a.sequence,
  abcCurve: a.abc,
}))

export const products = mockProducts.map((p) => ({
  ...p,
  group: 'Geral',
}))
