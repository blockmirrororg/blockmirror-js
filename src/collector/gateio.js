const Emitter = require("events");
const CoinCodes = require("../../CoinList");
const CCXT = require("ccxt");

const coinEmitter = new Emitter();
const gateio = new CCXT.gateio();

setInterval(async () => {
  const data = await gateio.fetchTickers();
  const result = CoinCodes.map((o) => {
    return {
      code: o,
      data: [data[`${o}/USDT`].ask, data[`${o}/CNYX`].ask],
    };
  });
  coinEmitter.emit("insert", result);
}, 1000);

module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
        coinEmitter.removeListener(event, listener);
    };
  },
};
