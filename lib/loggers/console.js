var moment = require('moment')
  , _ = require('underscore')
  , debug = require('debug')
;

exports = module.exports = createLogger;

function createLogger(config){
  logger = new Logger(config);
  return logger;
}

/**
 * creates a writeable logger
 * 
 * @param {object} config optional
 * @api private
 */

function Logger(config){
  var self = this;
  var defaults = {
    name: 'console',
    ts_output_format: 'YYYY/MM/DD HH:mm:ss',
  };
  self.config = _.extend(defaults, config || {} );
  self.formatter = defaultFormatter;
  self.writable = true;
  self.debug = debug(self.config.name);
}

/**
 * formats data for output
 * 
 * @param {int} timestamp
 * @param {object} data
 * @api public
 */

Logger.prototype.format = function(timestamp, data){
  return this.formatter(timestamp, data);
}

/**
 * Write data console[log/debug/error]
 */
Logger.prototype.write = function(){
  return this.debug.apply(this, arguments); 
}

/**
 * Formats data in to a tabulated String.
 *
 * @param {int} timestamp
 * @param {Object} data
 */

function defaultFormatter(timestamp, data){
  var values = Object.keys(data).sort().map(function(key){
    return data[key].value; 
  });
  return moment(timestamp).format(this.config.ts_output_format) + ' ' + values.join(' ');
}
