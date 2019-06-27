const WebSocket = require('ws')
const pako = require('pako')
const WS_URL = 'wss://api.huobi.pro/ws'

// eslint-disable-next-line require-jsdoc
module.exports = class Huobi {
  // eslint-disable-next-line require-jsdoc
  constructor(openCB) {
    this.handles = new Map()
    this.ws = new WebSocket(WS_URL)

    this.ws.on('open',() => { 
      openCB()
    })

    this.ws.on('message', async data => {
      const text = pako.inflate(data, {
        to: 'string'
      })
      const msg = JSON.parse(text)
      if (msg.ping) {
        this.ws.send(
          JSON.stringify({
            pong: msg.ping
          })
        )
      } else if (msg.tick) {
        const symbol = msg.ch.split('.')[1]
        const channel = msg.ch.split('.')[2]
        try {
          if (this.handles.has(`${channel}_${symbol}`)) {
            const cb = this.handles.get(`${channel}_${symbol}`)
            await cb(msg.tick)
          }
        } catch (error) {
          console.log(`${channel}_${symbol} cb error ${error.message}`)
          throw new Error(`${channel}_${symbol} cb error ${error.message}`)
        }
      } else {
        console.log(text)
      }
    })
    this.ws.on('close', () => {
      throw new Error('houbi ws close')
    })
    this.ws.on('error', err => {
      throw new Error('houbi ws error', err)
    })
  }

  // eslint-disable-next-line require-jsdoc
  subDepth(piars, cb) {
    this.ws.send(
      JSON.stringify({
        sub: `market.${piars}.trade.detail`,
        id: piars
      })
    )

    this.handles.set(`trade_${piars}`, cb)

    return () => {
      this.handles.delete(`trade_${piars}`)
    }
  }
}