const axios = require("./src/axios");
const stockEmitter = require("./src/collector/juhe");
const sinaStockEmitter = require("./src/collector/sina");

stockEmitter.addListener("insert", async (data) => {
  // const res = await axios.post("/chain/transaction",newData);
  // console.log(res)
});

sinaStockEmitter.addListener("insert", async (datas) => {
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i];
    const args = [data.open, data.close, data.high, data.low, data.avg];
    const buf = Buffer.alloc(args.length * 4);
    for (let i = 0; i < args.length; i++) {
      buf.writeFloatLE(args[i], i * 4);
    }
    try {
      await axios.post("chain/data", {
        name: data.code,
        data: buf.toString("hex"),
      });
    } catch (error) {}
  }
});
