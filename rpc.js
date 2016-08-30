const { EventEmitter } = require('events');

class Server extends EventEmitter {

  constructor (uid, input, output) {
    super();
    this.ipcListener = this.ipcListener.bind(this);

    if (this.destroyed) return;

    this.id = uid;
    this.input = input;
    this.output = output;

    input.on(uid, this.ipcListener);

    // we intentionally subscribe to `on` instead of `once`
    // to support reloading the window and re-initializing
    // the channel
    output.on('did-finish-load', () => {
      output.send('init', uid);
    });
  }

  ipcListener (event, { ev, data }) {
    super.emit(ev, data);
  }

  emit (ch, data) {
    this.wc.send(this.id, { ch, data });
  }

  destroy () {
    this.removeAllListeners();
    this.wc.removeAllListeners();
    if (this.id) {
      ipcMain.removeListener(this.id, this.ipcListener);
    } else {
      // mark for `genUid` in constructor
      this.destroyed = true;
    }
  }

}

module.exports = function createRPC (win) {
  return new Server(win);
};
