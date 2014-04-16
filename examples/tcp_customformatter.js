/*
 * Dependencies 
 */

var fake_server = require('./fake_server')
  , revere = require('../')
;

/*
 * Create `revere` instance with `name`
 */

var Rev = revere('example_console_logger');

/*
 * Connect to a socketIO server and listen for status events
 */

Rev.connect('status','http://localhost:3000');

/*
 * Create tcp server that writes to connected tcp streams the default
 * port is 5000
 *
 * > node tcp.js
 *
 * then in another shell session.
 * > telnet localhost 5000
 */

Rev.createTCPServer(customFormmater);

function customFormmater(timestamp, data){
  var values = Object.keys(data).sort().map(function(key){
    return key+ ":" + data[key].value; 
  });
  return "CustomFormatter >> " + values.join(' ') + '\n';
}
