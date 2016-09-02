/**
 * A separate Webpack config is required for the browser-side build of Hyperterm.
 * It has a different entry-point file, and needs to use the "web" target in order
 * for Node built-ins to be properly shimmed.
 */

const path = require('path');

exports = module.exports = require('./webpack.config.js');
exports.entry = './lib/index-browser.js';
exports.output.path = path.join(__dirname, 'server', 'public'),
exports.target = 'web';
