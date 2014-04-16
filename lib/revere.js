/**
 * Module dependencies.
 */

var net = require("net")
  , _ = require('underscore')
  , debug = require('debug')('revere')
;

/**
 * Expose `getRevereInstance(name, config)`.
 */

exports = module.exports = getRevereInstance;

/**
 * Runtime lookup of currently registered reveres
 */

var reveres = {};

/**
 * Creates or returns a `Revere` instance based on name.
 *
 * @param {String} name
 * @param {Object} config
 * @api public
 */

function getRevereInstance(name, config){
  if(typeof name === 'object'){ 
    config = name;
    name = config.name;
  }

  if(typeof name !== 'string'){
    var msg = 'getRevereInstance requires the first parameter be a `String` or an' 
    + 'object with a `name` property';
    throw new Error(msg);
  }
  
  var o = reveres[name];
  if(!o){
    o = new Revere(name, config); 
    // save instance into runtime lookup
    reveres[name] = o;
  }

  debug('created revere instance with name %s', name);

  return o;
}


/**
 * Initialize `Revere`
 *
 * @param {String} name
 * @param {Object} config
 * @api private
 */

function Revere(name, config){
  var self = this
    , defaults = {
        tcpPort:5000,
        outputDir:"./ouput",
        socketIODataEvent: "data"
      }
  ;

  self.name = name;
  self.config = _.extend(defaults,config||{});
  self._connections = [];
}

/**
 * Connects to socketIO and listens to `dataEventName` emits.
 *
 * @param {String} dataEventName
 * @param {String} uri optional 
 * @api public
 */

Revere.prototype.connect = function(dataEventName, uri){
  var self = this;

  dataEventName = dataEventName || self.config.socketIODataEvent;
  uri = uri || self.config.socketIOURI;

  self.socketIO = require('socket.io-client').connect(uri);
  self.socketIO.on(dataEventName, function (data) {
    
    // alive socket list
    var alive = [];

    // get data from object
    var timestamp = Date.now();
    while(self._connections.length){
      sock = self._connections.shift();
      if(sock.writable && sock.format){
        sock.write( sock.format(timestamp, data) );

        // lets keep the socket
        alive.push(sock);
      }else{
        sock.destroy();
      }
    }

    // update connections
    self._connections = alive;
  });

  debug('connected to %s and listening to \'%s\' events', uri, dataEventName)
}

/**
 * Creates a tcpServer of a supplied port.
 *
 * @param {int} port optional
 * @param {function} outputFormatter optional
 * @api public
 */

Revere.prototype.createTCPServer = function(port,outputFormatter){
  
  var self = this;
  if(typeof port === 'function'){
    outputFormatter = port;
    port = undefined;
  }

  port = port || self.config.tcpPort;
  outputFormatter = outputFormatter || defaultFormatter;

  if(self.tcpServer) {
    debug('tcp server already running on port: %s', port);
    return;
  }

  self.tcpServer = net.createServer();
  self.tcpServer.on('connection', function(socket){
    debug('connection established');

    // register default formatter for tcp server sockets
    socket.format = outputFormatter; 

    // save the socket so we can write to it
    self._connections.push(socket);
  });

  self.tcpServer.on('close', function(socket){
    debug('connection dropped');
  });
  
  self.tcpServer.listen(port);
  debug('tcp server is running on port: %s', port);
}

/**
 * Adds a logger to the connection pool so we can write to it later.
 *
 * @param {WriteStream} logger
 * @api public
 */

Revere.prototype.registerLogger = function(logger){
  this._connections.push(logger);
}

/**
 * Default formatter used by the tcp server connections.
 *
 * @param {int} timestamp
 * @param {object} data
 * @api private
 */

function defaultFormatter(timestamp, data){
  var values = Object.keys(data).sort().map(function(key){
    return data[key].value; 
  });
  return timestamp + ' ' + values.join(' ') + '\n';
}

/**
 * Expose default loggers
 */

exports.tsvLogger = require('./loggers/tsv');
exports.consoleLogger = require('./loggers/console');
