const axios = require("./src/axios");
const usaStockEmitter = require("./src/collector/usaStock");
const hkStockEmitter = require("./src/collector/hkStock");
const sinaStockEmitter = require("./src/collector/sina");
const coinEmitter = require("./src/collector/marketData");

// eslint-disable-next-line require-jsdoc
async function sendDataToBlock(datas) {
  try {
    await axios.post("chain/data", JSON.stringify(datas));
  } catch (error) {
    console.log(error.message);
  }
}

(async () => {
  usaStockEmitter.addListener("insert", async (datas) => {
    const results = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      results.add({
        name: data.code,
        data: buf.toString("hex"),
      });
    }
    await sendDataToBlock(results);
  });

  hkStockEmitter.addListener("insert", async (datas) => {
    const results = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      results.add({
        name: data.code,
        data: buf.toString("hex"),
      });
    }
    await sendDataToBlock(results);
  });

  sinaStockEmitter.addListener("insert", async (datas) => {
    const results = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      results.add({
        name: data.code,
        data: buf.toString("hex"),
      });
    }
    await sendDataToBlock(results);
  });

  coinEmitter.addListener("insert", async (datas) => {
    const results = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = data.data;
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      results.add({
        name: data.code,
        data: buf.toString("hex"),
      });
    }
    await sendDataToBlock(results);
  });
})();
