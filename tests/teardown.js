const axios = require("../src/axios");

module.exports = async function () {
  console.log("Exiting blockmirror tests");
  await axios.get('node/stop');
}