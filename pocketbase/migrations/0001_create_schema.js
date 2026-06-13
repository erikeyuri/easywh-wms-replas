migrate(
  (app) => {
    const createCol = (config) => {
      const col = new Collection(config)
      app.save(col)
      return col.id
    }

    const compId = createCol({
      name: 'companies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'branch', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['Ativo', 'Inativo'] },
        { name: 'erp', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const whId = createCol({
      name: 'warehouses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'companyId',
          type: 'relation',
          collectionId: compId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'code', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'type', type: 'select', values: ['Físico', 'Virtual', 'Real'] },
        { name: 'status', type: 'select', values: ['Ativo', 'Inativo'] },
        { name: 'erpCode', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const zoneId = createCol({
      name: 'zones',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'warehouseId',
          type: 'relation',
          collectionId: whId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'code', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'allocationRule', type: 'select', values: ['FIFO', 'FEFO', 'LIFO'] },
        { name: 'supplySequence', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const addrId = createCol({
      name: 'addresses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'zoneId',
          type: 'relation',
          collectionId: zoneId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'code', type: 'text', required: true },
        { name: 'type', type: 'select', values: ['Picking', 'Pulmão', 'Bloqueado', 'Doca'] },
        {
          name: 'lockStatus',
          type: 'select',
          values: ['Liberado', 'Bloqueado Entrada', 'Bloqueado Saída', 'Bloqueado Total'],
        },
        { name: 'pickingSequence', type: 'number' },
        { name: 'abcCurve', type: 'select', values: ['A', 'B', 'C'] },
        { name: 'maxPallets', type: 'number' },
        { name: 'maxVolume', type: 'number' },
        { name: 'maxWeight', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const prodId = createCol({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'sku', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'group', type: 'text' },
        { name: 'unit', type: 'text' },
        { name: 'barcode', type: 'text' },
        { name: 'abcCurve', type: 'select', values: ['A', 'B', 'C'] },
        { name: 'length', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'standardQty', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const opId = createCol({
      name: 'operators',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'access_type', type: 'select', values: ['admin', 'master', 'collector'] },
        { name: 'status', type: 'select', values: ['active', 'inactive'] },
        { name: 'password', type: 'text' },
        { name: 'barcode', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    createCol({
      name: 'balances',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'product_id',
          type: 'relation',
          collectionId: prodId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'address_id',
          type: 'relation',
          collectionId: addrId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'batch', type: 'text' },
        { name: 'expiry_date', type: 'date' },
        { name: 'quantity_available', type: 'number' },
        { name: 'quantity_reserved', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    createCol({
      name: 'movements',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'product_id',
          type: 'relation',
          collectionId: prodId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'origin_address', type: 'text' },
        { name: 'destination_address', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'batch', type: 'text' },
        {
          name: 'type',
          type: 'select',
          values: ['transfer', 'adjust_in', 'adjust_out', 'receipt', 'picking'],
        },
        { name: 'source_doc', type: 'text' },
        { name: 'operator_id', type: 'relation', collectionId: opId, maxSelect: 1 },
        { name: 'timestamp', type: 'autodate', onCreate: true },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    const receiptId = createCol({
      name: 'receipts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'doc_number', type: 'text' },
        { name: 'status', type: 'select', values: ['pending', 'in_progress', 'completed'] },
        { name: 'entry_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    createCol({
      name: 'receipt_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'receipt_id',
          type: 'relation',
          collectionId: receiptId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          collectionId: prodId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number' },
        { name: 'batch', type: 'text' },
        { name: 'expiry_date', type: 'date' },
        { name: 'current_address', type: 'text' },
        { name: 'status', type: 'select', values: ['pending_putaway', 'putaway_completed'] },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
  },
  (app) => {
    ;[
      'receipt_items',
      'receipts',
      'movements',
      'balances',
      'operators',
      'products',
      'addresses',
      'zones',
      'warehouses',
      'companies',
    ].forEach((name) => {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (e) {}
    })
  },
)
