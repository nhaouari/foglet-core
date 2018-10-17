'use strict';

const AbstractUnicast = require('./../abstract/abstract-unicast.js')
const MUnicast = require('./messages/municast.js')

/**
 * Unicast represent the base implementation of an unicast protocol for the foglet library.
 * @extends AbstractUnicast
 * @author Arnaud Grall (Folkvir)
 */


 class Unicast extends AbstractUnicast {
  /**
   * Constructor
   * @param  {AbstractNetwork} source - The source RPS/overlay
   * @param  {string} protocol - The name of the unicast protocol
   */
  constructor (source, protocol) {
    super(source, protocol)
    // this._unicast = new UnicastDefinition(this._source.rps, {pid: this._protocol})this._unicast = new UnicastDefinition(this._source.rps, {pid: this._protocol})
    // this.adaptRPS(this._source.rps)
    this.psp=this._source.rps
    this.psp.addProtocol(this)
    this.options=Object.assign({retry: 0, pid: 'default-unicast'},{pid: this._protocol})


    this.on(this._protocol, (id, message) => {
      this._receive(id, message);
    })
  }

  /**
   * Send a message to a peer using its ID.
   * This peer must be a neighbour.
   * @param  {string}  id  - The id to send the message
   * @param  {*} message - The message to send
   * @return {Promise} A Promise fulfilled when the message is sent
   */
  send (id, message) {
   return this.psp.send(id, new MUnicast(this.options.pid, this._protocol, [this._source.outviewId, message]),this.options.retry)
  }


  /**
   * Send a message to multiple peers
   * @param  {string[]} ids - Set of peer IDs
   * @param  {Object} message - Message to send
   * @return {Promise} A Promise fulfilled when all message have been sent
   */
  sendMultiple (ids = [], message) {
    return ids.reduce((prev, peerID) => {
      return prev.then(() => this.send(peerID, message));
    }, Promise.resolve());
  }

  /**
   * Handler executed when a message is recevied
   * @param  {string} id  - Message issuer's ID
   * @param  {*} message - The message received
   * @return {void}
   */
  _receive (id, message) {
    this.emit('receive', id, message);
  }

}

module.exports = Unicast;
