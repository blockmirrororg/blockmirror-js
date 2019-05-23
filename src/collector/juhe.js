const axios = require('axios')
const Emitter = require('events')

const { stockAdapter } = require('./adapter/juhe')

const stockListUrl = `http://web.juhe.cn:8080/finance/stock/usaall?key=7807c70f8ca32b8080ef7a81b1f43552&page=1&type=3`
const stockEmitter = new Emitter()

const stockType = ['AAPL', 'MSFT', 'AMZN', 'GOOGL']

const timeFilter = time => {
  const currentHour = time.getHours()
  const currentMinutes = time.getMinutes()
  return (
    (currentHour === 22 && currentMinutes >= 30) ||
    currentHour > 22 ||
    currentHour < 5
  )
}

const fetch = () => {
  const currentTime = new Date()
  if (timeFilter(currentTime)) {
    axios
      .get(stockListUrl)
      .then(data => {
        data = data.data
        if (data.result.error_code) throw new Error(data.reason)
        data.result.data.forEach(e => {
          e.time = currentTime.getTime()
        })

        result = data.result.data
          .map(o => stockAdapter(o))
          .filter(o => stockType.includes(o.code))

        stockEmitter.emit('insert', result)

        console.log(`fetch stocklist ${data.result.totalCount}`)
      })
      .catch(err => {
        console.log(err.message)
      })
  } else {
    console.log(
      `当前时间${new Date().toLocaleString()},还没有到美股开市时间，不fetch数据！`
    )
  }
  setTimeout(fetch, 180 * 1000)
}

fetch()

module.exports = {
  addListener(event, listener) {
    stockEmitter.addListener(event, listener)
    return () => {
      stockEmitter.removeListener(event, listener)
    }
  }
}
