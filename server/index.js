const http = require('http');
const resolve = require('path').resolve;

const sio = require('socket.io');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

const RPC = require('../rpc');
const Session = require('./session');

// Create static file server
const serve = serveStatic(resolve(__dirname, 'public'), {
  index: ['index.html', 'index.htm']
});
const server = http.createServer(function (req, res) {
  serve(req, res, finalhandler(req, res))
});

// Create socket.io server
const io = sio(server);

io.on('connection', function (socket) {
  const sessions = new Map();
  const uid = socket.id;
  socket.send = socket.emit;

  console.log('a user connected: %j', uid);
  const rpc = new RPC(uid, socket, socket);

  rpc.on('init', () => {
    rpc.emit('session add req');
  });

  rpc.on('resize', ({ cols, rows }) => {
    sessions.forEach((session) => {
      session.resize({ cols, rows });
    });
  });

  rpc.on('data', ({ uid, data }) => {
    sessions.get(uid).write(data);
  });

  rpc.on('open external', ({ url }) => {
    shell.openExternal(url);
  });

  rpc.on('new', ({ rows = 40, cols = 100, cwd = '$HOME' }) => {
    const session = new Session({ rows, cols, cwd, dockerId: '34094bc6f3a4' });
    sessions.set(uid, session);

    rpc.emit('session add', {
      uid,
      shell: session.shell,
      pid: session.pty.pid
    });

    session.on('data', (data) => {
      rpc.emit('session data', { uid, data });
    });

    session.on('title', (title) => {
      //win.setTitle(title);
      rpc.emit('session title', { uid, title });
    });

    session.on('exit', () => {
      rpc.emit('session exit', { uid });
      sessions.delete(uid);
    });
  });

  rpc.on('focus', ({ uid }) => {
    const session = sessions.get(uid);
    //if (typeof session !== 'undefined' && typeof session.lastTitle !== 'undefined') {
    //  win.setTitle(session.lastTitle);
    //}
    if (session) {
      session.focus();
    } else {
      console.log('session not found by', uid);
    }
  });

  rpc.on('blur', ({ uid }) => {
    const session = sessions.get(uid);

    if (session) {
      session.blur();
    } else {
      console.log('session not found by', uid);
    }
  });

  rpc.on('exit', ({ uid }) => {
    const session = sessions.get(uid);

    if (session) {
      session.exit();
    } else {
      console.log('session not found by', uid);
    }
  });

  // kick things off…
  var ev = {};
  socket.emit('init', ev, uid);

  socket.once('disconnect', function () {
    console.log('user disconnected');
  });
});

server.listen(3000);
