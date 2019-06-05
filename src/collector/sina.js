const Emitter = require("events");
const { stockAdapter } = require("./adapter/sina");
const { stock } = require("tushare");
const StockList = require("../../StockList");

const stockEmitter = new Emitter();

const stockType = StockList.china.map((o) => o.code);

const timeFilter = (time) => {
  const currentHour = time.getHours();
  const currentMinutes = time.getMinutes();
  return (
    (currentHour === 9 && currentMinutes >= 30) ||
    (currentHour > 9 && currentHour < 11) ||
    (currentHour >= 13 && currentHour < 15) ||
    (currentHour === 11 && currentMinutes <= 30)
  );
};

const fetch = () => {
  const currentTime = new Date();
  if (timeFilter(currentTime)) {
    const options = {
      codes: stockType,
    };
    stock
      .getLiveData(options)
      .then(({ data }) => {
        for (let i = 0; i < data.length; i++) {
          data[i] = stockAdapter(data[i]);
        }
        stockEmitter.emit("insert", data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    console.log(
      `当前时间${new Date().toLocaleString()},还没有到A股开市时间，不fetch数据！`,
    );
  }
  setTimeout(fetch, 1 * 1000);
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
