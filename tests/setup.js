const spawn = require("cross-spawn");
const axios = require("../src/axios");
const Transaction = require("../src/transaction");

const Generator = new Transaction();
const bp1Priv =
  "95D4B0DF5B1069B47F35C8C7A6764BB8B760D0359B6C1221DDCB46CE5830E14C";

module.exports = async function() {
  console.log("Initializing blockmirror tests");
  const rmCommand =
    process.platform === "win32"
      ? ["rmdir", ["../running", "/s/q"]]
      : ["rm", ["-rf", "../running"]];
  spawn.sync(rmCommand[0], rmCommand[1], { stdio: "inherit" });
  spawn.sync("mkdir", ["../running"], { stdio: "inherit" });
  const rpc = await spawn("../build/test/test_network", ["../config.json"], {
    stdio: "inherit",
    cwd: "../running",
    detached: true,
  });

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
  try {
    const format = Generator.createNewFormat(
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
    );

    console.log({
      at: "beforeAll",
      action: "post NewFormat",
      status: "starting",
      context: JSON.stringify(format),
    });

    await axios.post("chain/transaction", JSON.stringify(format));

    console.log({
      at: "beforeAll",
      action: "post Format",
      status: "successed",
    });
  } catch (error) {
    console.log({
      at: "beforeAll",
      action: "post NewFormat",
      status: "error",
      message: error.message,
    });
    throw new Error("beforAll失败！");
  }

  try {
    const dataType = Generator.createNewDataType(
      [bp1Priv],
      {
        format: "A股",
        name: "sz000001",
        desc: "国内某股票",
      },
      1000000,
      0,
    );
    console.log({
      at: "beforeAll",
      action: "post DataType",
      status: "starting",
      context: JSON.stringify(dataType),
    });

    await axios.post("chain/transaction", JSON.stringify(dataType));

    console.log({
      at: "beforeAll",
      action: "post DataType",
      status: "successed",
    });
  } catch (error) {
    console.log({
      at: "beforeAll",
      action: "post DataType",
      status: "error",
      message: error.message,
    });
    throw new Error("beforAll失败！");
  }
}
