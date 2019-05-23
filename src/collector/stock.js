module.exports = class Stock {
  // eslint-disable-next-line require-jsdoc
  constructor(stock = {}) {
    this.code = stock.code || ''
    this.open = stock.open || 0
    this.close = stock.close || 0
    this.high = stock.high || 0
    this.low = stock.low || 0
    this.avg = stock.avg || 0
  }
}
