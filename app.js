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

const newFormat = Generator.createNewFormat(
  [bp1Priv],
  {
    name: "stock",
    desc: "代表五个浮点 股价上限 下限 最高 最低 平均 发送一个",
    dataFormat: "0101010101",
    validScript: "01",
    resultScript: "02",
  },
  1000000,
  0,
);

const newDataType = Generator.createNewDataType(
  [bp1Priv],
  {
    format: "stock",
    name: "aapl",
    desc: "苹果的股票啊",
  },
  1000000,
  0,
);

setTimeout(async () => {
  try {
    console.log(
      await axios.post("chain/transaction", JSON.stringify(newFormat)),
    );
  } catch (error) {}
  try {
    console.log(
      await axios.post("chain/transaction", JSON.stringify(newDataType)),
    );
  } catch (error) {}
});

stockEmitter.addListener("insert", async (data) => {
  // const res = await axios.post("/chain/transaction",newData);
  // console.log(res)
});

sinaStockEmitter.addListener("insert", (data) => {});
