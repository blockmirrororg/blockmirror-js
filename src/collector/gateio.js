const Emitter = require("events");
const CoinCodes = require("../../CoinList");
const CCXT = require("ccxt");

const coinEmitter = new Emitter();
const ex = new CCXT.binance();
const gateio = new CCXT.gateio();

setInterval(async () => {
  let data;
  let rmbPrice;
  try {
    data = await ex.fetchTickers();
    rmbPrice = await gateio.fetchTicker("USDT/CNYX");
    const result = CoinCodes.map((o) => {
      return {
        code: o,
        data: [data[`${o}/USDT`].ask, rmbPrice.ask * data[`${o}/USDT`].ask],
      };
    });
    coinEmitter.emit("insert", result);
  } catch (error) {
    setTimeout(() => {
      throw new Error(error.message);
    });
  }
}, 1000);

module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
      coinEmitter.removeListener(event, listener);
    };
  },
};
