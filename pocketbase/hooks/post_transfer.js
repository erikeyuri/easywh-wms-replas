routerAdd(
  'POST',
  '/backend/v1/transfer',
  (e) => {
    const body = e.requestInfo().body
    const { product_id, origin_address_id, destination_address_id, quantity, batch } = body

    if (!product_id || !origin_address_id || !destination_address_id || quantity <= 0) {
      return e.badRequestError('Missing or invalid parameters')
    }

    $app.runInTransaction((txApp) => {
      let originBal
      try {
        originBal = txApp.findFirstRecordByFilter(
          'balances',
          'product_id = {:p} && address_id = {:a} && batch = {:b}',
          { p: product_id, a: origin_address_id, b: batch || '' },
        )
      } catch (_) {
        throw new BadRequestError('Origin balance not found')
      }

      if (originBal.getInt('quantity_available') < quantity) {
        throw new BadRequestError('Insufficient quantity')
      }

      originBal.set('quantity_available', originBal.getInt('quantity_available') - quantity)
      txApp.save(originBal)

      let destBal
      try {
        destBal = txApp.findFirstRecordByFilter(
          'balances',
          'product_id = {:p} && address_id = {:a} && batch = {:b}',
          { p: product_id, a: destination_address_id, b: batch || '' },
        )
        destBal.set('quantity_available', destBal.getInt('quantity_available') + quantity)
      } catch (_) {
        const col = txApp.findCollectionByNameOrId('balances')
        destBal = new Record(col)
        destBal.set('product_id', product_id)
        destBal.set('address_id', destination_address_id)
        destBal.set('batch', batch || '')
        destBal.set('expiry_date', originBal.getString('expiry_date'))
        destBal.set('quantity_available', quantity)
        destBal.set('quantity_reserved', 0)
      }
      txApp.save(destBal)

      const movCol = txApp.findCollectionByNameOrId('movements')
      const mov = new Record(movCol)
      mov.set('product_id', product_id)
      mov.set('origin_address', origin_address_id)
      mov.set('destination_address', destination_address_id)
      mov.set('quantity', quantity)
      mov.set('batch', batch || '')
      mov.set('type', 'transfer')
      txApp.save(mov)
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
