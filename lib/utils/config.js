//import { ipcRenderer, remote } from 'electron';
//const plugins = remote.require('./plugins');

export default class Config {
  getConfig () {
    //return plugins.getDecoratedConfig();
    return {};
  }

  subscribe (fn) {
    //ipcRenderer.on('config change', fn);
    //ipcRenderer.on('plugins change', fn);
    return () => {
      //ipcRenderer.removeListener('config change', fn);
    };
  }
}
