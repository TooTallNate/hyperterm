import EventEmitter from 'events';
import io from 'socket.io-client';

export default class Client extends EventEmitter {

  constructor () {
    super();
    this.setupIpc();
    this.ipcListener = this.ipcListener.bind(this);
    if (window.__rpcId) {
      setTimeout(() => {
        this.id = window.__rpcId;
        this.ipc.on(this.id, this.ipcListener);
        super.emit('ready');
      }, 0);
    } else {
      this.ipc.once('init', (ch, uid) => {
        console.log('init', ch, uid);
        // we cache so that if the object
        // gets re-instantiated we don't
        // wait for a `init` event
        window.__rpcId = uid;
        this.id = uid;
        this.ipc.on(uid, this.ipcListener);
        super.emit('ready');
      });
    }
  }

  setupIpc() {
    //const electron = window.require('electron');
    //this.ipc = electron.ipcRenderer;
    this.ipc = io(`${ location.protocol }//${ location.host }`);
    this.ipc.send = this.ipc.emit;
  }

  ipcListener (ev, { ch, data }) {
    console.log('ipcListener', ev, ch, data);
    super.emit(ch, data);
  }

  emit (ev, data) {
    if (!this.id) throw new Error('Not ready');
    this.ipc.send(this.id, { ev, data });
  }

  destroy () {
    this.removeAllListeners();
    this.ipc.removeAllListeners();
  }

}
