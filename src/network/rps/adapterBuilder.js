const Neighborhood = require('neighborhood-wrtc')

class adapterBuilder {

  getAdaptedRPS (rps, options) {
    const rpsClass = rps.constructor
    class AdaptedRPS extends rpsClass {
      constructor (rps, options) {
        super(options)

        // change neighborhood

        this.NI = this.options.inview || new Neighborhood(Object.assign(this.options, {peer: this.options.peer + '-I'}))
        this.NO = this.options.outview || new Neighborhood(Object.assign(this.options, {peer: this.options.peer + '-O'}))
        // #3 initialize the interfaces
        this.II = this.NI.register(this)
        this.IO = this.NO.register(this)

        this.__receive = rps._receive
        this._registredProtocols = new Map()
      }

      addProtocol (unicast) {
        this._registredProtocols.set(unicast._protocol, unicast)
      }

      getProtocol (pid) {
        return this._registredProtocols.get(pid)
      }

      routeMsgtoUnicast (message) {
        const unicast = this.getProtocol(message.pid)
        if (unicast) {
          unicast._receive(...(message.args))
        } else {
          throw new Error('_receive, no registred protocol ' + message.pid)
        }
      }

      _receive (peerId, message) {
        if (message.type && message.type === 'MUnicast') {
          this.routeMsgtoUnicast(message)
        } else {
          this.__receive(peerId, message)
        }
      }
    }

    let adaptedRPS = new AdaptedRPS(rps, options)

    return adaptedRPS
  }
}

module.exports = adapterBuilder
