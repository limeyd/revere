/*
 * Dependencies 
 */

var fake_server = require('./fake_server')
  , revere = require('../')
;

/*
 * Create `revere` instance with `name`
 */

var Revere = revere('example_console_logger');

/*
 * Connect to a socketIO server and listen for status events
 */

Revere.connect('status','http://localhost:3000');

/*
 * register console logger
 * this uses `debug` as the console logger so set the `DEBUG` enviroment
 * variable to `console` as the default.
 *
 * > `DEBUG=console node console.js`
 */

Revere.registerLogger(revere.consoleLogger());

/*
 * Register cusomized `consoleLogger`
 * 
 * > `DEBUG=XYZ node console.js`
 */

// Revere.registerLogger(revere.consoleLogger({
//   name: "XYZ",
//   ts_output_format: "MM/DD/YYYY HH:mm:ss"
// }));
