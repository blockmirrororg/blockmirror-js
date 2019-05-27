const axios = require("../src/axios");

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
    await axios.post("chain/data", {
      name: "sz000001",
      data: buf.toString("hex"),
    }),
  ).toHaveReturned();
});
