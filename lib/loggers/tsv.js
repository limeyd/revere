var moment = require("moment")
  , rotator = require('stream-rotate')
  , csv = require('csv')
  , fs = require('fs')
  , path = require('path')
  , _ = require('underscore')
  , debug = require('debug')('tsvLogger')
;

exports = module.exports = createLogger;

function createLogger(config){
  logger = new Logger(config);
  return logger;
}

function Logger(config){
  var self = this;
  var defaults = {
    path: './out',
    name: 'output',
    ext: 'tsv',
    freq: '5s',
    retention: 10,
    ts_format: 'YYYYMMDD_HHmmss',
    ts_output_format: 'DD/MM/YYYY HH:mm:ss',
    write_header:true
  };

  self.config = _.extend(defaults, config );
  self.formatter = defaultFormatter;
  self.rotator = rotator(self.config);
  self.rotator.on('rotated', function(){
    debug('Log Rotated');
    self.writeHeader = self.config.write_header;
  });
  debug('Initialized');
}
/**
 * formats the data for output
 */

Logger.prototype.format = function(timestamp, data){
  var self = this,
  writeHeader = self.writeHeader;
  self.writeHeader = false;
  return self.formatter(timestamp, data, writeHeader);
}

/**
 *  Expose stream to Logger 
 */

Logger.prototype.__defineGetter__('writable', function(){
  if(!this.rotator) return false;
  return this.rotator.writable;
});

['end', 'destroy', 'write'].forEach(function(method){
  Logger.prototype[method] = function(){
    return this.rotator[method].apply(this.rotator, arguments); 
  }
});

/*
 * Formats data in to a tabulated String
 */

function defaultFormatter(timestamp, data, writeHeader){
  var hdr='',keys = Object.keys(data).sort();

  if(writeHeader){
    hdr = 'timestamp\t'+keys.join('\t')+'\n'; 
  }
  var values = keys.map(function(key){
    return data[key].value; 
  });
  return hdr+moment(timestamp).format(this.config.ts_output_format) + '\t' + values.join('\t') + '\n';
}

//
//Expose an EXPRESS API

exports.API = API;

function API(logger){
  var config = logger.config;
  var filenameFormat = config.name+'_'+config.ts_format+'.'+config.ext;
  debug('API Requested');

  // create Cache Directory
  var cacheDir = path.join(config.path,'cache_'+config.name);
  if(!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
  }

  return function(req, res){
    var d, from = moment(req.query.from, req.query.format),
    to = moment(req.query.to, req.query.format),
    fields = req.query.fields.split(','),
    now = moment();

    // get a list of all files in the output directory
    //
    fs.readdir(config.path, function(err, listOfFiles){ 
      // filter files based on logger prefix and datetime
      listOfFiles = listOfFiles.filter(function(file){
        fileTimestamp = moment(file,filenameFormat);

        if(file === config.name +'.'+ config.ext){
          return now.isSame(from,'day') || now.isSame(to,'day');
        }
        
        if(fileTimestamp.isValid()){
          return fileTimestamp.isAfter(from) && fileTimestamp.isBefore(to) || 
            fileTimestamp.isSame(from,'day') || fileTimestamp.isSame(to,'day');
        }
      });

      if(listOfFiles.length == 0){
        res.end();
      }else{

        // generate unique filename base on fields and requested to/from timestamps
        var fieldsStr = fields.join('-').replace(/[^\w-]/g,'_');
        var outfile = path.join(cacheDir,
                                [ config.name,
                                  moment(from).format(config.ts_format),
                                  moment(to).format(config.ts_format),
                                  fieldsStr].join('-')+'.'+config.ext);
                                
        fs.writeFileSync(outfile, fields.join('\t')+'\n'); // write headers once
        // process files
        function next(files){
          var f = path.join(config.path,files.shift());
          csv()
          .from(f, {
            delimiter:'\t', 
            columns:true
          })
          .to.path(outfile, {
            columns: fields 
            , eof: true // without this there will be no newline between files and the line will cause problems for client
            , flags: 'a'
          })
          // could move this to config
          .transform(function(row){
            var rowtime = moment(row.timestamp, config.ts_output_format);
            return (rowtime.isAfter(from) &&  rowtime.isBefore(to)) ? row : undefined;
          })
          .on('close',function(){
            if(files.length){
              next(files);
            }else{
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ data: outfile }));
            }
          });
        }
        next(listOfFiles);
      }
    });
  }
}
