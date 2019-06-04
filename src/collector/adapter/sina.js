const Stock = require("../stock");

module.exports = {
  stockAdapter(data) {
    return new Stock({
      code: data[0],
      crrentPrice: data[33] === "00" ? Number(data[4]) : 0,
    });
  },
};
