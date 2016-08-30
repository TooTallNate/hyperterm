const path = require('path');

exports = module.exports = require('./webpack.config.js');
exports.entry = './lib/index-browser.js';
exports.output.path = path.join(__dirname, 'server', 'public'),
exports.target = 'web';
