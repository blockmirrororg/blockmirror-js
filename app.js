const axios = require("./src/axios");
const stockEmitter = require("./src/collector/juhe");
const sinaStockEmitter = require("./src/collector/sina");
const Transaction = require("./src/transaction");
const secp256k1 = require("secp256k1");

const Generator = new Transaction();

const bp1Priv =
  "068972C2BB42DF301DA05BBCEF718A8516FA03F10DC62BA5A08223516B99F200";
const bp2Priv =
  "9DC54FB3E7493E97D7B9130DAB4CC75275DE02199FD19E4A4CBDBEF539F6D496";
const bp3Priv =
  "B19375F1D6A3CC299C27DD6F793E91234B6E8CA9692131E6E8F320B83F84FF2C";

const bp3Pub = secp256k1
  .publicKeyCreate(Buffer.from(bp3Priv, "hex"))
  .toString("hex")
  .toUpperCase();

const transfer = Generator.createTransfer(bp1Priv, bp3Pub, 1000000, 2, 0);
const bpJoin = Generator.createBPJoin(
  [bp1Priv, bp2Priv],
  bp3Pub,
  2,
  3470473166,
);
const bpLeave = Generator.createBPLeave([bp1Priv, bp2Priv], bp3Pub, 2, 0);

const newFormat = Generator.createNewFormat(
  [bp1Priv, bp2Priv],
  {
    name: "stock",
    desc: "代表五个浮点 股价上限 下限 最高 最低 平均 发送一个",
    dataFormat: "0101010101",
    validScript: "01",
    resultScript: "02",
  },
  2,
  0,
);

const newDataType = Generator.createNewDataType(
  [bp1Priv, bp2Priv],
  {
    format: "stock",
    name: "aapl",
    desc: "苹果的股票啊",
  },
  2,
  0,
);

setTimeout(async () => {
  console.log(await axios.post("chain/transaction", JSON.stringify(newFormat)))
  console.log(await axios.post("chain/transaction", JSON.stringify(newDataType)))
});

stockEmitter.addListener("insert", async (data) => {
  // const res = await axios.post("/chain/transaction",newData);
  // console.log(res)
});

sinaStockEmitter.addListener("insert", (data) => {});
