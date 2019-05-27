const axios = require("./src/axios");
const stockEmitter = require("./src/collector/juhe");
const sinaStockEmitter = require("./src/collector/sina");
const Transaction = require("./src/transaction");
const secp256k1 = require("secp256k1");

const Generator = new Transaction();

const bp1Priv =
  "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";
const bp2Priv =
  "ee1b121c066398218b0cec6f4445db11ee0b59d2db3037720f9ef5efd86b317f";
const bp3Priv =
  "B19375F1D6A3CC299C27DD6F793E91234B6E8CA9692131E6E8F320B83F84FF2C";

const bp3Pub = secp256k1
  .publicKeyCreate(Buffer.from(bp3Priv, "hex"))
  .toString("hex")
  .toUpperCase();

// const transfer = Generator.createTransfer(bp1Priv, bp3Pub, 1000000, 2, 0);
// const bpJoin = Generator.createBPJoin(
//   [bp1Priv, bp2Priv],
//   bp3Pub,
//   2,
//   3470473166,
// );
// const bpLeave = Generator.createBPLeave([bp1Priv, bp2Priv], bp3Pub, 2, 0);

(async () => {
  try {
    await axios.post(
      "chain/transaction",
      Generator.createNewFormat(
        [bp1Priv],
        {
          name: "A股",
          desc: "代表五个浮点 股价上限 下限 最高 最低 平均 ",
          dataFormat: "0101010101",
          validScript: "01",
          resultScript: "02",
        },
        1000000,
        0,
      ),
    );

    await axios.post(
      "chain/transaction",
      Generator.createNewFormat(
        [bp1Priv],
        {
          name: "美股",
          desc: "代表五个浮点 股价上限 下限 最高 最低 平均 ",
          dataFormat: "0101010101",
          validScript: "01",
          resultScript: "02",
        },
        1000000,
        0,
      ),
    );

    await axios.post(
      "chain/transaction",
      Generator.createNewDataType(
        [bp1Priv],
        {
          format: "A股",
          name: "sz000001",
          desc: "国内某股票",
        },
        1000000,
        0,
      ),
    );

    await axios.post(
      "chain/transaction",
      Generator.createNewDataType(
        [bp1Priv],
        {
          format: "A股",
          name: "sh600000",
          desc: "国内某股票",
        },
        1000000,
        0,
      ),
    );

    await axios.post(
      "chain/transaction",
      Generator.createNewDataType(
        [bp1Priv],
        {
          format: "美股",
          name: "aapl",
          desc: "苹果的股票",
        },
        1000000,
        0,
      ),
    );
  } catch (error) {}

  const chainLast = await axios.get("chain/last");
  console.log(JSON.stringify(chainLast));
  const chainStatus = await axios.get("chain/status");
  console.log(JSON.stringify(chainStatus));
  const chainByHash = await axios.get("chain/block?" + chainLast.producer);
  console.log(JSON.stringify(chainByHash));
  const chainTransaction = await axios.get("chain/transaction?" + chainLast.producer);
  console.log(JSON.stringify(chainTransaction));
  const chainFormat = await axios.get("chain/format?A股");
  console.log(JSON.stringify(chainFormat));
  const chainDataType = await axios.get("chain/datatypes?sz000001");
  console.log(JSON.stringify(chainDataType));
  const chainBps = await axios.get("chain/bps");
  console.log(JSON.stringify(chainBps));

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
        buf.writeFloatBE(args[i], i * 4);
      }
      try {
        await axios.post("chain/data", {
          name: data.code,
          data: buf.toString("hex"),
        });
      } catch (error) {}
    }
  });
})();
