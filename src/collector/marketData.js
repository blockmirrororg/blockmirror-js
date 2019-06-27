const WS = require("ws");
const Emitter = require("events");
const CoinCodes = require("../../CoinList");
const Huobi = require("./huobiws");

const coinEmitter = new Emitter();
let rmbPrice = 0;
const coinInfo = new Map();

let huobiTraders = [];

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

      if (coinInfo.has(obj.id)) {
        try {
          coinEmitter.emit("insert", [
            {
              code: coinInfo.get(obj.id),
              data: [
                Number(obj.result.asks[0][0]),
                rmbPrice * Number(obj.result.asks[0][0]),
              ],
            },
          ]);
        } catch (error) {
          console.log(error.message, JSON.stringify(obj));
        }
      }

      if (obj.id === 1000000) {
        rmbPrice = Number(obj.result.asks[0][0]);
      }
    });

    this.ws.on("close", () => {
      throw new Error("gateio ws close");
    });
    this.ws.on("error", (err) => {
      throw new Error("gateio ws error", err);
    });
  }

  // eslint-disable-next-line require-jsdoc
  queryDepth(id, piars) {
    socket_send_cmd(id, this.ws, "depth.query", [piars, 5, "0.0001"]);
  }
}

const marketData = new MarketData(() => {
  marketData.queryDepth(1000000, `USDT_CNYX`);
  setInterval(() => marketData.queryDepth(1000000, `USDT_CNYX`), 1000);
});

const huobi = new Huobi(() => {
  setTimeout(() => {
    CoinCodes.forEach((o) => {
      huobi.subDepth(`${o}usdt`.toLocaleLowerCase(), (data) => {
        coinEmitter.emit("insert", [
          {
            code: o,
            data: [data.data[0].price, data.data[0].price * rmbPrice],
          },
        ]);
      });
    });
  }, 2000);
});

module.exports = {
  addListener(event, listener) {
    coinEmitter.addListener(event, listener);
    return () => {
      coinEmitter.removeListener(event, listener);
    };
  },
};
