/*
 * Dependencies 
 */
var moment = require('moment')
  , fake_server = require('./fake_server')
  , revere = require('../')
;

/*
 * Create `revere` instance with `name`
 */

var Rev = revere('example_tsv_logger');

/*
 * Connect to a socketIO server and listen for status events
 */

5bor.connect('status','http://localhost:3000');

/*
 * register TSV logger with Defaults
 */

var logger = revere.tsvLogger();
Rev.registerLogger(logger);
/*
 * Register cusomized `tsvLogger`
 */

// Rev.registerLogger(revere.tsvLogger({
//     path: './out',
//     name: 'output',
//     ext: 'tsv',
//     freq: '10s',
//     retention: 5,
//     ts_format: 'YYYYMMDD_HHmmss',
//     ts_output_format: 'DD/MM/YYYY HH:mm:ss'
// }));

var req = {
  query: {
    from: moment().subtract('days', 1).format('M/D/YYYY HHmmss'),
    to:   moment().endOf('day').format('M/D/YYYY HHmmss'),
    format: 'M/D/YYYY HHmmss',
    fields: ["timestamp", "tag1", "tag2"]
  }
}
var res = {
  end:function(){
    console.log(this);
  }
}

var api = revere.tsvLogger.API(logger);
api(req, res);

