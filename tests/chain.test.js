const axios = require("../src/axios");
const Transaction = require("../src/transaction");

const Generator = new Transaction();
const bp1Priv = "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";

beforeEach(async () => {
  await axios.post(
    "chain/transaction",
    JSON.stringify(
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
  );

  await axios.post(
    "chain/transaction",
    JSON.stringify(
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
  );
});

test("test for chain/transaction post NewFormat 'A股' and get", async () => {
  const format = await axios.get(`chain/format?${encodeURIComponent("A股")}`);
  expect(format).toHaveProperty("name", "A股");
});

test("test for chain/transaction post NewDataType 'sz000001' and get", async () => {
  const dataType = await axios.get("chain/datatypes?sz000001");
  expect(dataType).toHaveProperty("name", "sz000001");
});

test("test for get chain/status ", async () => {
  const status = await axios.get("chain/status");
  expect(status).toHaveProperty("height");
});

test("test for get chain/bps ", async () => {
  const bps = await axios.get("chain/bps");
  expect(bps).toHaveReturned();
});

test("test for post chain/data", async () => {
  const args = [110.22, 115.1, 160.2, 100.3, 130.22];
  const buf = Buffer.alloc(args.length * 4);
  for (let i = 0; i < args.length; i++) {
    buf.writeFloatBE(args[i], i * 4);
  }
  expect(
    await axios.post(
      "chain/data",
      JSON.stringify({
        name: "sz000001",
        data: buf.toString("hex"),
      }),
    ),
  ).toHaveReturned();
});
