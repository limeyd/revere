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
 * Create tcp server that writes to connected tcp streams the default
 * port is 5000
 *
 * > node tcp.js
 *
 * then in another shell session.
 * > telnet localhost 5000
 */

Revere.createTCPServer();
