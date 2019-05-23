const Stock = require('../stock')

module.exports = {
  stockAdapter(data) {
    return new Stock({
      code: data[0],
      open: Number(data[2]),
      close: Number(data[3]),
      high: Number(data[5]),
      low: Number(data[6]),
      avg:Number(data[4])
    })
  }
}
