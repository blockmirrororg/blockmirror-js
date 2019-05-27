const axios = require("../src/axios");
const Transaction = require("../src/transaction");
// const secp256k1 = require("secp256k1");

const Generator = new Transaction();
const bp1Priv =
  "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";

// const bp2Priv =
//   "ee1b121c066398218b0cec6f4445db11ee0b59d2db3037720f9ef5efd86b317f";
// const bp3Priv =
//   "B19375F1D6A3CC299C27DD6F793E91234B6E8CA9692131E6E8F320B83F84FF2C";

// const bp3Pub = secp256k1
//   .publicKeyCreate(Buffer.from(bp3Priv, "hex"))
//   .toString("hex")
//   .toUpperCase();

test("test for chain/transaction post NewFormat 'A股' and get", async () => {
  expect(
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
    ),
  ).toEqual({});

  const format = await axios.get(`chain/format?${encodeURIComponent("A股")}`);
  expect(format).toHaveProperty("name", "A股");
});

test("test for chain/transaction post NewDataType 'sz000001' and get", async () => {
  expect(
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
    ),
  ).toEqual({});
  const dataType = await axios.get("chain/datatypes?sz000001");
  expect(dataType).toHaveProperty("name", "sz000001");
});
