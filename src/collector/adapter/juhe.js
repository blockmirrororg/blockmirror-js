const Stock = require('../stock')

module.exports = {
  stockAdapter(data) {
    return new Stock({
      code: data['symbol'],
      open: Number(data['open']),
      close: Number(data['price']),
      high: Number(data['high']),
      low: Number(data['low'])
    })
  }
}
