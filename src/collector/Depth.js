
module.exports = class Depth {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        this.asks = {}
        this.bids = {}
    }
    // eslint-disable-next-line require-jsdoc
    gateIo(update) {
        if (update.asks) {
            update.asks.forEach(e => {
                if (e[1] <= 0.0000001 && this.asks[e[0]]) {
                    delete this.asks[e[0]]
                } else {
                    this.asks[e[0]] = e[1]
                }
            });
        }

        if (update.bids) {
            update.bids.forEach(e => {
                if (e[1] <= 0.0000001 && this.bids[e[0]]) {
                    delete this.bids[e[0]]
                } else {
                    this.bids[e[0]] = e[1]
                }
            });
        }
    }

    // eslint-disable-next-line require-jsdoc
    Asks() {
        const result = []
        const keys = Object.keys(this.asks).sort()
        keys.forEach(o => {
            result.push([Number(o), this.asks[o]])
        })
        return result;
    }

    // eslint-disable-next-line require-jsdoc
    Bids() {
        const result = []
        const keys = Object.keys(this.bids).sort((a, b) => { return b - a })
        keys.forEach(o => {
            result.push([Number(o), this.bids[o]])
        })
        return result;
    }
}