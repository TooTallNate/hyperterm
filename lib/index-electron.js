import rpc from './rpc';
import load from './load';
import * as config from './utils/config';
import * as plugins from './utils/plugins';
import { webFrame } from 'electron';

// Disable pinch zoom
webFrame.setZoomLevelLimits(1, 1);

const mount = document.getElementById('mount');

load({
  rpc,
  config,
  plugins,
  mount
});
