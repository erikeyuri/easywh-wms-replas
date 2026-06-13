routerAdd(
  'POST',
  '/backend/v1/transfer-cart',
  (e) => {
    const body = e.requestInfo().body || {}
    const items = body.items

    if (!items || !Array.isArray(items) || items.length === 0) {
      return e.badRequestError('O carrinho está vazio.')
    }

    $app.runInTransaction((txApp) => {
      for (const item of items) {
        if (item.quantity <= 0) {
          throw new BadRequestError('A quantidade deve ser maior que zero.')
        }

        const originBalance = txApp.findRecordById('balances', item.balance_id)
        const currentAvailable = originBalance.getInt('quantity_available')

        if (currentAvailable < item.quantity) {
          throw new BadRequestError(
            `Saldo insuficiente para o produto. Solicitado: ${item.quantity}, Disponível: ${currentAvailable}`,
          )
        }

        originBalance.set('quantity_available', currentAvailable - item.quantity)
        txApp.save(originBalance)

        let destBalance
        try {
          destBalance = txApp.findFirstRecordByFilter(
            'balances',
            'product_id = {:pid} && address_id = {:aid} && batch = {:batch}',
            { pid: item.product_id, aid: item.destination_address_id, batch: item.batch || '' },
          )
        } catch (_) {}

        if (destBalance) {
          destBalance.set(
            'quantity_available',
            destBalance.getInt('quantity_available') + item.quantity,
          )
          txApp.save(destBalance)
        } else {
          const balancesCol = txApp.findCollectionByNameOrId('balances')
          destBalance = new Record(balancesCol)
          destBalance.set('product_id', item.product_id)
          destBalance.set('address_id', item.destination_address_id)
          destBalance.set('batch', item.batch || '')
          destBalance.set('quantity_available', item.quantity)
          destBalance.set('quantity_reserved', 0)
          txApp.save(destBalance)
        }

        const originAddr = txApp.findRecordById('addresses', item.origin_address_id)
        const destAddr = txApp.findRecordById('addresses', item.destination_address_id)

        const movCol = txApp.findCollectionByNameOrId('movements')
        const mov = new Record(movCol)
        mov.set('product_id', item.product_id)
        mov.set('origin_address', originAddr.getString('code'))
        mov.set('destination_address', destAddr.getString('code'))
        mov.set('quantity', item.quantity)
        mov.set('batch', item.batch || '')
        mov.set('type', 'transfer')
        txApp.save(mov)
      }
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
