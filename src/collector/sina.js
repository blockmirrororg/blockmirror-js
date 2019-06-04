const Emitter = require("events");
const WebSocket = require("ws");

const stockEmitter = new Emitter();

/**
 * 开始通过WEBSOCKET监听股票
 * @param {String} stockCode 股票代码列表
 */
function start(stockCode) {
  let ws;

  setInterval(() => {
    switch (ws.readyState) {
      case WebSocket.CLOSED:
        break;
      case WebSocket.CONNECTING:
        break;
      case WebSocket.CLOSING:
        break;
      case WebSocket.OPEN:
        ws.ticket++;
        if (ws.ticket === 60) {
          ws.ping();
          ws.pong();
        }
        // 根据数据生成报告
        // console.log(ws.ticket);
        break;
    }
  }, 1000);

  const onopen = () => {
    console.log("新浪行情接口已经连接");
  };
  const onclose = (code, reason) => {
    console.log("新浪行情接口已经断开", code, reason);
    connect();
  };
  const onerror = (err) => {
    console.log("新浪行情接口发生错误", err);
    ws.terminate();
    connect();
  };
  const onmessage = (data) => {
    /**
      代码 =“证券简称,今日开盘价,昨日收盘价,最近成交价,最高成交价,最低成交价,买入价,卖出价,成交数量,成交金额,买数量一,买价位一,买数量二,买价位二,买数量三 ,买价位三,买数量四,买价位四,买数量五,买价位五,卖数量一,卖价位一,卖数量二,卖价位二,卖数量三,卖价位三,卖数量四,卖价位四,卖数量五,卖价位五,行情日期,行情时间,停牌状态”
      根据自己实际经验发现：停牌状态为"03"时就是股票停牌了，为"00"表示正常

      // 最近成交
      // 最高成交
      // 
     */
    console.log(data);
  };

  const connect = () => {
    console.log("正在连接新浪行情接口...");
    ws = new WebSocket(`ws://hq.sinajs.cn/wskt?list=${stockCode}`, {
      perMessageDeflate: true,
      origin: "http://finance.sina.com.cn",
    });
    ws.on("open", onopen);
    ws.on("close", onclose);
    ws.on("error", onerror);
    ws.on("message", onmessage);
    ws.ticket = 0;
  };

  connect();
}

start("hk01810");

module.exports = {
  addListener(event, listener) {
    stockEmitter.addListener(event, listener);
    return () => {
      stockEmitter.removeListener(event, listener);
    };
  },
};
