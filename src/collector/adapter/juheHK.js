const Stock = require("../stock");

module.exports = {
  stockAdapter(data) {
    return new Stock({
      code: 'HKEx_' + data.symbol,
      crrentPrice: data.lasttrade,
    });
  },
};
