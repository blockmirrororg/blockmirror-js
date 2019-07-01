const WS = require("ws");
const Emitter = require("events");
const CoinCodes = require("../../CoinList");

const coinEmitter = new Emitter();
let rmbPrice = 0;
const result = new Map();

// eslint-disable-next-line require-jsdoc
function socket_send_cmd(clientId, socket, cmd, params) {
  if (!params) params = [];
  const msg = {
    id: clientId,
    method: cmd,
    params: params,
  };
  socket.send(JSON.stringify(msg));
}

// eslint-disable-next-line require-jsdoc
class MarketData {
  // eslint-disable-next-line require-jsdoc
  constructor(openCB) {
    this.ws = new WS("wss://ws.gateio.ws/v3/");
    this.handles = new Map();

    this.ws.on("open", () => {
      setInterval(() => {
        socket_send_cmd(-1, this.ws, "server.ping");
      }, 5000);
      openCB();
    });

    this.ws.on("message", async (e) => {
      const obj = JSON.parse(e);
      if (obj.error) {
        console.log(JSON.stringify(obj.error));
        return;
      }

      if (obj.method === "trades.update") {
        if (
          obj.params &&
          obj.params instanceof Array &&
          obj.params.length > 0
        ) {
          const coin = obj.params[0].split("_")[0];
          const price = obj.params[1][0].price;
          result.set(coin, [price, price * rmbPrice]);
        }
      }

      if (obj.id === 1000000) {
        rmbPrice = Number(obj.result.asks[0][0]);
      }
    });

    this.ws.on("close", () => {
      setTimeout(() => {
        throw new Error("gateio ws close");
      });
    });
    this.ws.on("error", (err) => {
      setTimeout(() => {
        throw new Error("gateio ws close");
      });
    });
  }

  // eslint-disable-next-line require-jsdoc
  queryDepth(id, piars) {
    socket_send_cmd(id, this.ws, "depth.query", [piars, 5, "0.0001"]);
  }
}

const marketData = new MarketData(() => {
  marketData.queryDepth(1000000, `USDT_CNYX`);
  socket_send_cmd(
    10,
    marketData.ws,
    "trades.subscribe",
    CoinCodes.map((o) => `${o.toLocaleUpperCase()}_USDT`),
  );
  setInterval(() => marketData.queryDepth(1000000, `USDT_CNYX`), 1000);
});

setInterval(() => {
  const data = [];
  CoinCodes.forEach((o) => {
    if (result.has(o)) {
      data.push({ code: o, data: result.get(o) });
    }
  });
  coinEmitter.emit("insert", data);
}, 1000);

module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
      coinEmitter.removeListener(event, listener);
    };
  },
};
