const axios = require("../src/axios");

test("test for chain/last", async () => {
  const lastBlock = await axios.get("chain/last");
  expect(lastBlock).toHaveProperty("timestamp");
  expect(lastBlock).toHaveProperty("hash");
  expect(lastBlock).toHaveProperty("height");
  expect(lastBlock).toHaveProperty("previous");
  expect(lastBlock).toHaveProperty("merkle");
  expect(lastBlock).toHaveProperty("producer");
  expect(lastBlock).toHaveProperty("coinbase.expire");
  expect(lastBlock).toHaveProperty("coinbase.nonce");
  expect(lastBlock).toHaveProperty("coinbase.signature");
  expect(lastBlock).toHaveProperty("coinbase.script.type");
  expect(lastBlock).toHaveProperty("coinbase.script.value.target");
  expect(lastBlock).toHaveProperty("coinbase.script.value.amount");
  expect(lastBlock).toHaveProperty("transactions");
  expect(lastBlock).toHaveProperty("datas");
});

// test("test for chain/block get by hash", async () => {
//   const blockHash = "skdfjlskdjflksdjflk";
//   const block = await axios.get(`chain/block?${blockHash}`);
//   expect(block).toHaveProperty("hash", blockHash);
// });
