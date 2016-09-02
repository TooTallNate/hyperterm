const { EventEmitter } = require('events');

class RPC extends EventEmitter {

  constructor (uid, input, output) {
    super();
    this.id = uid;
    this.input = input;
    this.output = output;

    this.ipcListener = this.ipcListener.bind(this);
    input.on(uid, this.ipcListener);
  }

  ipcListener (event, args) {
    //console.log('ipcListener', event, args);
    super.emit(args.ev, args.data);
  }

  emit (ch, data) {
    const fakeEvent = {};
    this.output.send(this.id, fakeEvent, { ch, data });
  }

  destroy () {
    this.removeAllListeners();
    this.output.removeAllListeners();
    this.input.removeListener(this.id, this.ipcListener);
  }

}
module.exports = RPC;
