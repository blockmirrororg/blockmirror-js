const Emitter = require("events");
const CoinCodes = require("../../CoinList");
const CCXT = require("ccxt");

const coinEmitter = new Emitter();
const ex = new CCXT.binance();
const gateio = new CCXT.gateio();

const fetch = async () => {

  const data = await ex.fetchTickers();
  const rmbPrice = await gateio.fetchTicker("USDT/CNYX");

  const result = CoinCodes.map((o) => {
    return {
      code: o,
      data: [data[`${o}/USDT`].ask, rmbPrice.ask * data[`${o}/USDT`].ask],
    };
  });
  coinEmitter.emit("insert", result);
  await new Promise((resolve) => setTimeout(resolve, 10));
  await fetch();
};

(async () => await fetch())();

module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
      coinEmitter.removeListener(event, listener);
    };
  },
};
