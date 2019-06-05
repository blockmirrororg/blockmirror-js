const spawn = require("cross-spawn");
const axios = require("../src/axios");
const Transaction = require("../src/transaction");
const StockList = require("../StockList");
const Format = require("../Format");

const Generator = new Transaction();
const bp1Priv =
  "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";

module.exports = async function() {
  console.log("Initializing blockmirror tests");

  spawn.sync("rm", ["-rf", "../running"], {
    stdio: "inherit",
  });
  spawn.sync("mkdir", ["../running"], {
    stdio: "inherit",
  });
  const rpc = await spawn("../build/test/test_network", ["../config.json"], {
    stdio: "inherit",
    cwd: "../running",
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    await beforeAll();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.log(error.message);
    process.kill(-rpc.pid);
    throw new Error();
  }
};

// eslint-disable-next-line require-jsdoc
async function beforeAll() {
  let format;
  for (let i = 0; i < Format.length; i++) {
    try {
      format = Generator.createNewFormat([bp1Priv], Format[i], 1000000, 0);
      await axios.post("chain/transaction", JSON.stringify(format));
      console.log({
        at: "beforeAll",
        action: "post Format",
        status: "successed",
        context: JSON.stringify(format),
      });
    } catch (error) {
      console.log({
        at: "beforeAll",
        action: "post NewFormat",
        status: "error",
        message: error.message,
        context: JSON.stringify(format),
      });
      throw new Error("beforAll失败！");
    }
  }

  let dataType;
  for (let i = 0; i < StockList.china.length; i++) {
    const type = StockList.china[i];
    dataType = Generator.createNewDataType(
      [bp1Priv],
      {
        format: "A股",
        name: type.symbol,
        desc: type.name,
      },
      1000000,
      0,
    );

    await axios.post("chain/transaction", JSON.stringify(dataType));
  }

  for (let i = 0; i < StockList.US.length; i++) {
    const type = StockList.US[i];
    dataType = Generator.createNewDataType(
      [bp1Priv],
      {
        format: "美股",
        name: type.symbol,
        desc: type.name,
      },
      1000000,
      0,
    );

    await axios.post("chain/transaction", JSON.stringify(dataType));
  }

  for (let i = 0; i < StockList.HK.length; i++) {
    const type = StockList.HK[i];
    dataType = Generator.createNewDataType(
      [bp1Priv],
      {
        format: "港股",
        name: type.symbol,
        desc: type.name,
      },
      1000000,
      0,
    );

    await axios.post("chain/transaction", JSON.stringify(dataType));
  }
}
