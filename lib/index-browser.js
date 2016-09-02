import rpc from './rpc';
import load from './load';
//import notify from './utils/notify';

const mount = document.getElementById('mount');

const config = {
  getConfig() { return {}; },
  subscribe() {}
};

const plugins = {
};

const middlewares = [];
plugins.middleware = (store) => (next) => (action) => {
  const nextMiddleware = remaining => action => remaining.length
    ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action)
    : next(action);
  nextMiddleware(middlewares)(action);
};

load({
  rpc,
  config,
  plugins,
  mount
});

//notify('hello', 'world!');
