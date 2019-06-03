const axios = require("../src/axios");

test("test get format 'A股'", async () => {
  const format = await axios.get(`chain/format?${encodeURIComponent("A股")}`);
  expect(format).toHaveProperty("name", "A股");
});

test("test get data type 'sz000001'", async () => {
  const dataType = await axios.get("chain/datatypes?sz000001");
  expect(dataType).toHaveProperty("name", "sz000001");
});

test("test for get chain/status ", async () => {
  const status = await axios.get("chain/status");
  expect(status).toHaveProperty("height");
});

test("test for get chain/bps ", async () => {
  const bps = await axios.get("chain/bps");
  expect(bps.length).toBeGreaterThanOrEqual(1);
});

test("test for post chain/data", async () => {
  const args = [110.22];
  const buf = Buffer.alloc(args.length * 4);
  for (let i = 0; i < args.length; i++) {
    buf.writeFloatLE(args[i], i * 4);
  }

  expect(
    await axios.post(
      "chain/data",
      JSON.stringify({
        name: "sz000001",
        data: buf.toString("hex"),
      }),
    ),
  ).toEqual({});
});

test("test for get chain/datatype ", async () => {
  const datatypes = await axios.get(
    `chain/datatype?${encodeURIComponent("A股")}`,
  );
  expect(datatypes).toEqual([
    {
      format: "A股",
      name: "sz000001",
      desc: "中国平安",
    },
  ]);
});

test("test for get chain/formats ", async () => {
  const datatypes = await axios.get(`chain/formats`);
  expect(datatypes).toEqual([
    {
      name: "A股",
      desc: "float 当前价格 ",
      dataFormat: "01",
      validScript: "01",
      resultScript: "02",
    },
  ]);
});
