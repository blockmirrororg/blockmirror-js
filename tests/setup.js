const spawn = require("cross-spawn");
const axios = require("../src/axios");
const Transaction = require("../src/transaction");

const Generator = new Transaction();
const bp1Priv = "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";

module.exports = async function() {
  console.log("Initializing blockmirror tests");
  spawn.sync("rm", ["-rf", "../running"], { stdio: "inherit" });
  spawn.sync("mkdir", ["../running"], { stdio: "inherit" });
  await spawn("../build/test/test_network", ["../config.json"], {
    stdio: "inherit",
    cwd: "../running",
  });
  await beforeAll();
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// eslint-disable-next-line require-jsdoc
async function beforeAll() {
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
}
