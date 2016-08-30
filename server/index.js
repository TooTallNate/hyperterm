const http = require('http');
const resolve = require('path').resolve;

const sio = require('socket.io');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

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
  const sessions = new Set();
  const uid = socket.id;
  console.log('a user connected: %j', uid);
  const rpc = new RPC(uid, socket, socket);

  function emit (ch, data) {
    socket.emit(String(uid), {}, { ch, data });
  }

  socket.on(String(uid), ({ ev, data }) => {
    console.log(ev, data);
    switch (ev) {
      case 'init':
        emit('session add req');
        break;
      case 'resize':
        onresize(data);
        break;
      case 'new':
        onnew(data);
        break;
      default:
        console.warn('unhandled event: %j = %j', ev, data);
    }
  });

  function onresize ({ cols, rows }) {
    sessions.forEach((session) => {
      session.resize({ cols, rows });
    });
  }

  function onnew ({ rows = 40, cols = 100, cwd = process.env.HOME }) {
    const shell = 'bash';

    emit('session add', {
      uid, shell, pid: 1
    });

    setTimeout(() => {
      const data = 'hello world!\n';
      emit('session data', { uid, data });
    }, 500);
  }

  var ev = {};
  socket.emit('init', ev, uid);

  //socket.emit('session data', { uid, data: 'hello world\n' });
  //socket.emit('session title', { uid, title: 'test' });

  socket.once('disconnect', function () {
    console.log('user disconnected');
  });
});

server.listen(3000);
