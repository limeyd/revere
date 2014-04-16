/*
 * Dependencies 
 */

var fake_server = require('./fake_server')
  , revere = require('../')
;

/*
 * Create `revere` instance with `name`
 */

var Rev = revere('example_tsv_logger');

/*
 * Connect to a socketIO server and listen for status events
 */

Rev.connect('status','http://localhost:3000');

/*
 * register console logger
 * this uses `debug` as the console logger so set the `DEBUG` enviroment
 * variable to `console` as the default.
 *
 * > `DEBUG=console node console.js`
 */

Rev.registerLogger(revere.tsvLogger());

/*
 * Register cusomized `tsvLogger`
 */

Rev.registerLogger(revere.tsvLogger({
    path: './out',
    name: 'output',
    ext: 'tsv',
    freq: '10s',
    retention: 5,
    ts_format: 'YYYYMMDD_HHmmss',
    ts_output_format: 'DD/MM/YYYY HH:mm:ss'
}));
