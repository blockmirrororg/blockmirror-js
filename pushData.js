const axios = require("./src/axios");
const usaStockEmitter = require("./src/collector/usaStock");
const hkStockEmitter = require("./src/collector/hkStock");
const sinaStockEmitter = require("./src/collector/sina");
const startUp = require("./tests/setup");
const coinEmitter = require('./src/collector/gateio');

(async () => {
  await startUp();
  usaStockEmitter.addListener("insert", (datas) => {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      try {
        axios.post("chain/data", {
          name: data.code,
          data: buf.toString("hex"),
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  });

  hkStockEmitter.addListener("insert", (datas) => {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      try {
        axios.post("chain/data", {
          name: data.code,
          data: buf.toString("hex"),
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  });

  sinaStockEmitter.addListener("insert", (datas) => {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.crrentPrice];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      try {
        axios.post("chain/data", {
          name: data.code,
          data: buf.toString("hex"),
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  });

  coinEmitter.addListener("insert", (datas) => {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const args = [data.data];
      const buf = Buffer.alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        buf.writeFloatLE(args[i], i * 4);
      }
      try {
        axios.post("chain/data", {
          name: data.code,
          data: buf.toString("hex"),
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  });
})();
