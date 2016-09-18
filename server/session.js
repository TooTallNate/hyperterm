const { EventEmitter } = require('events');
const { productName, version } = require('../app/package');
const spawn = require('child_pty').spawn;

module.exports = class Session extends EventEmitter {

  constructor ({ rows, cols: columns, cwd, id }) {
    super();

    // don't inherit from `process.env` since we're spawning
    // a docker bash instance
    const baseEnv = {
      //SHELL: '/bin/bash',
      LANG: 'en_US.UTF-8',
      TERM: 'xterm-256color',
      TERM_PROGRAM: productName,
      TERM_PROGRAM_VERSION: version
    };

    const env = Object.keys(baseEnv).map(name => {
      return `${name}=${baseEnv[name]}`;
    });
    const shell = 'kubectl';
    const args = ['exec', '-i', '-t', id, '--', 'env', ...env ];

    // this is the actual $SHELL we're going to be running inside the container
    args.push('sh', '-c', 'cd ' + cwd + '; exec $(command -v bash || echo sh) --login');

    console.log(shell, args);

    this.pty = spawn(shell, args, {
      columns,
      rows,
      // for Docker, the env vars and cwd are handled from within
      // the container via `env` and `cd` in the command line args
      env: Object.assign({
        ROWS: rows,
        COLUMNS: columns
      }, process.env)
    });

    this.pty.stdout.on('data', (data) => {
      if (this.ended) {
        return;
      }
      this.emit('data', data.toString('utf8'));
    });

    this.pty.on('exit', () => {
      if (!this.ended) {
        this.ended = true;
        this.emit('exit');
      }
    });

    this.shell = shell;
    this.getTitle();
  }

  focus () {
    this.subscribed = true;
    this.getTitle();
  }

  blur () {
    this.subscribed = false;
    clearTimeout(this.titlePoll);
  }

  getTitle () {
    /*
    if ('win32' === process.platform) return;
    if (this.fetching) return;
    this.fetching = true;

    let tty = this.pty.stdout.ttyname;
    tty = tty.replace(/^\/dev\/tty/, '');

    // try to exclude grep from the results
    // by grepping for `[s]001` instead of `s001`
    tty = `[${tty[0]}]${tty.substr(1)}`;

    // TODO: limit the concurrency of how many processes we run?
    // TODO: only tested on mac
    exec(`ps uxac | grep ${tty} | head -n 1`, (err, out) => {
      this.fetching = false;
      if (this.ended) return;
      if (err) return;
      let title = out.split(' ').pop();
      if (title) {
        title = title.replace(/^\(/, '');
        title = title.replace(/\)?\n$/, '');
        if (title !== this.lastTitle) {
          this.emit('title', title);
          this.lastTitle = title;
        }
      }

      if (this.subscribed) {
        this.titlePoll = setTimeout(() => this.getTitle(), TITLE_POLL_INTERVAL);
      }
    });
    */
  }

  exit () {
    this.destroy();
  }

  write (data) {
    this.pty.stdin.write(data);
  }

  resize ({ cols: columns, rows }) {
    try {
      this.pty.stdout.resize({ columns, rows });
    } catch (err) {
      console.error(err.stack);
    }
  }

  destroy () {
    try {
      this.pty.kill('SIGHUP');
    } catch (err) {
      console.error('exit error', err.stack);
    }
    this.emit('exit');
    this.ended = true;
    this.blur();
  }

};
