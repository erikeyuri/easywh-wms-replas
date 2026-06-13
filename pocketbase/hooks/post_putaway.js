routerAdd(
  'POST',
  '/backend/v1/putaway',
  (e) => {
    const body = e.requestInfo().body
    const { receipt_item_id, destination_address_id } = body

    if (!receipt_item_id || !destination_address_id) {
      return e.badRequestError('Missing receipt_item_id or destination_address_id')
    }

    $app.runInTransaction((txApp) => {
      let item
      try {
        item = txApp.findRecordById('receipt_items', receipt_item_id)
      } catch (_) {
        throw new BadRequestError('Item not found')
      }

      if (item.getString('status') !== 'pending_putaway') {
        throw new BadRequestError('Item is not pending putaway')
      }

      const prodId = item.getString('product_id')
      const qty = item.getInt('quantity')
      const batch = item.getString('batch')
      const expiry = item.getString('expiry_date')

      item.set('status', 'putaway_completed')
      txApp.save(item)

      let balance
      try {
        balance = txApp.findFirstRecordByFilter(
          'balances',
          'product_id = {:p} && address_id = {:a} && batch = {:b}',
          { p: prodId, a: destination_address_id, b: batch || '' },
        )
        balance.set('quantity_available', balance.getInt('quantity_available') + qty)
      } catch (_) {
        const col = txApp.findCollectionByNameOrId('balances')
        balance = new Record(col)
        balance.set('product_id', prodId)
        balance.set('address_id', destination_address_id)
        balance.set('batch', batch || '')
        balance.set('expiry_date', expiry || '')
        balance.set('quantity_available', qty)
        balance.set('quantity_reserved', 0)
      }
      txApp.save(balance)

      const movCol = txApp.findCollectionByNameOrId('movements')
      const mov = new Record(movCol)
      mov.set('product_id', prodId)
      mov.set('origin_address', 'Doca')
      mov.set('destination_address', destination_address_id)
      mov.set('quantity', qty)
      mov.set('batch', batch || '')
      mov.set('type', 'receipt')
      txApp.save(mov)
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
