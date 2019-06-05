const axios = require("axios");
const Emitter = require("events");
const StockList = require("../../StockList");

const { stockAdapter } = require("./adapter/juheHK");

const stockListUrl = `http://web.juhe.cn:8080/finance/stock/hkall?key=7807c70f8ca32b8080ef7a81b1f43552&page=1&type=3`;
const stockEmitter = new Emitter();

const stockType = StockList.HK.map((o) => o.symbol);

const timeFilter = (time) => {
  const currentHour = time.getHours();
  const currentMinutes = time.getMinutes();
  return (
    (currentHour === 9 && currentMinutes >= 30) ||
    (currentHour > 9 && currentHour < 16)
  );
};

const fetch = () => {
  const currentTime = new Date();
  if (timeFilter(currentTime)) {
    axios
      .get(stockListUrl)
      .then((data) => {
        if (data.result.error_code) throw new Error(data.reason);
        data.result.data.forEach((e) => {
          e.time = currentTime.getTime();
        });

        const result = data.result.data
          .map((o) => stockAdapter(o))
          .filter((o) => stockType.includes(o.code));

        stockEmitter.emit("insert", result);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    console.log(
      `当前时间${new Date().toLocaleString()},还没有到港股开市时间，不fetch数据！`,
    );
  }
  setTimeout(fetch, 200 * 1000);
};

fetch();

module.exports = {
  addListener(event, listener) {
    stockEmitter.addListener(event, listener);
    return () => {
      stockEmitter.removeListener(event, listener);
    };
  },
};
