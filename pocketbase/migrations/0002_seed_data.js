migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'erikeyuri@gmail.com')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = new Record(users)
      record.setEmail('erikeyuri@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }

    const create = (colName, data) => {
      const col = app.findCollectionByNameOrId(colName)
      const rec = new Record(col)
      Object.keys(data).forEach((k) => rec.set(k, data[k]))
      app.save(rec)
      return rec.id
    }

    try {
      app.findFirstRecordByData('companies', 'code', 'EMP01')
      return
    } catch (e) {}

    const c1 = create('companies', {
      code: 'EMP01',
      branch: 'FL01',
      name: 'Logistics Matrix SP',
      status: 'Ativo',
      erp: 'ERP-101',
    })
    const c2 = create('companies', {
      code: 'EMP01',
      branch: 'FL02',
      name: 'Logistics Matrix RJ',
      status: 'Ativo',
      erp: 'ERP-102',
    })
    const c3 = create('companies', {
      code: 'EMP02',
      branch: 'FL01',
      name: 'Global Dist',
      status: 'Ativo',
      erp: 'ERP-201',
    })

    const w1 = create('warehouses', {
      companyId: c1,
      code: 'ARM-SP-01',
      description: 'Armazém Principal SP',
      type: 'Real',
      status: 'Ativo',
      erpCode: 'WH-01',
    })
    const w2 = create('warehouses', {
      companyId: c1,
      code: 'ARM-SP-02',
      description: 'Armazém Secundário SP',
      type: 'Virtual',
      status: 'Ativo',
      erpCode: 'WH-02',
    })

    const z1 = create('zones', {
      warehouseId: w1,
      code: 'Z-01',
      description: 'Zona de Picking A',
      type: 'Dinâmica',
      allocationRule: 'FEFO',
      supplySequence: 10,
    })
    const z2 = create('zones', {
      warehouseId: w1,
      code: 'Z-02',
      description: 'Pulmão',
      type: 'Blocada',
      allocationRule: 'FIFO',
      supplySequence: 20,
    })

    const a1 = create('addresses', {
      zoneId: z1,
      code: '01-01-A-01',
      type: 'Picking',
      lockStatus: 'Liberado',
      pickingSequence: 1,
      abcCurve: 'A',
      maxPallets: 1,
      maxVolume: 1.5,
      maxWeight: 1000,
    })
    const a2 = create('addresses', {
      zoneId: z2,
      code: '99-01-Z-99',
      type: 'Pulmão',
      lockStatus: 'Liberado',
      pickingSequence: 99,
      abcCurve: 'C',
      maxPallets: 2,
      maxVolume: 3.0,
      maxWeight: 2000,
    })
    const dock = create('addresses', {
      zoneId: z1,
      code: 'DOCA-01',
      type: 'Doca',
      lockStatus: 'Liberado',
      pickingSequence: 0,
      abcCurve: 'A',
      maxPallets: 10,
      maxVolume: 100,
      maxWeight: 10000,
    })

    const p1 = create('products', {
      sku: 'SKU-1001',
      description: 'Caixa Organizadora M',
      type: 'Embalagem',
      group: 'Geral',
      unit: 'UN',
      barcode: '789100000001',
      abcCurve: 'A',
      length: 10,
      width: 10,
      height: 10,
      standardQty: 50,
    })
    const p2 = create('products', {
      sku: 'SKU-2044',
      description: 'Monitor LED 24"',
      type: 'Eletrônicos',
      group: 'Geral',
      unit: 'UN',
      barcode: '789100000002',
      abcCurve: 'B',
      length: 60,
      width: 40,
      height: 20,
      standardQty: 10,
    })
    const p3 = create('products', {
      sku: 'SKU-8890',
      description: 'Cabo HDMI 2m',
      type: 'Acessórios',
      group: 'Geral',
      unit: 'UN',
      barcode: '789100000003',
      abcCurve: 'A',
      length: 5,
      width: 5,
      height: 2,
      standardQty: 100,
    })

    const op1 = create('operators', {
      code: 'OP-001',
      name: 'João Coletor',
      access_type: 'collector',
      status: 'active',
      barcode: '123456',
    })

    create('balances', {
      product_id: p1,
      address_id: a1,
      batch: 'L1',
      quantity_available: 100,
      quantity_reserved: 0,
    })
    create('balances', {
      product_id: p2,
      address_id: dock,
      batch: 'L2',
      quantity_available: 50,
      quantity_reserved: 0,
    })

    const rec1 = create('receipts', {
      doc_number: 'NF-001',
      status: 'in_progress',
      entry_date: new Date().toISOString(),
    })
    create('receipt_items', {
      receipt_id: rec1,
      product_id: p3,
      quantity: 200,
      batch: 'L3',
      current_address: 'Doca',
      status: 'pending_putaway',
    })
  },
  (app) => {},
)
