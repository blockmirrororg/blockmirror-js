module.exports = class Stock {
  // eslint-disable-next-line require-jsdoc
  constructor(stock = {}) {
    this.code = stock.code 
    this.crrentPrice = stock.crrentPrice 
  }
}
