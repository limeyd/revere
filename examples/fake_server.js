/*
 * Dependencies 
 */

var socketio = require('socket.io')
  , revere = require('../')

// create socket.io server
var io = socketio.listen(3000);
io.set('log level', 1);

/*
 * Datasets that get emitted
 */

var datasets = {};

/*
 * Easy update lookup
 */

var tags = {
  "tag1": {
    set: "status"
  },
  "tag2": {
    set: "status"
  },
  "tag3": {
    set: "levels"
  },
  "tag4": {
    set: "levels"
  }
};

/*
 * Create datasets from tags
 */

Object.keys(tags).forEach(function(key){
  var tag = tags[key];
  var ds = datasets[tag.set];

  if(!ds){
    ds = datasets[tag.set] = {};
  }
  ds[key] = tag;
});

/*
 * Contrived Data and brodcast
 */

setInterval(function(){

  var ts = Date.now();
  Object.keys(tags).forEach(function(key){
    tags[key].value = Math.round(10+Math.random()*100);
    tags[key].ts = ts;
  });

  // emit each dataset
  Object.keys(datasets).forEach(function(key){
    io.sockets.emit(key, datasets[key]);
  });
  
}, 1000);

