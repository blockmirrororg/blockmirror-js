const Emitter = require("events");
const CoinCodes = require("../../CoinList");
const CCXT = require("ccxt");

const coinEmitter = new Emitter();
const gateio = new CCXT.gateio();

const fetch = async() => {
  const data = await gateio.fetchTickers();
  const result = CoinCodes.map((o) => {
    return {
      code: o,
      data: [data[`${o}/USDT`].ask, data[`${o}/CNYX`].ask],
    };
  });
  coinEmitter.emit("insert", result);
  setTimeout(fetch, 1 * 1000);
};

(async()=>await fetch())()


module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
        coinEmitter.removeListener(event, listener);
    };
  },
};
