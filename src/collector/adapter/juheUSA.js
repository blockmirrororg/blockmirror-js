const Stock = require("../stock");

module.exports = {
  stockAdapter(data) {
    return new Stock({
      code: data.market + "_" + data.symbol,
      crrentPrice: data.price,
    });
  },
};
