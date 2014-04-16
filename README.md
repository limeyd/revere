# Revere

Simple nodejs library for connecting SocketIO events to writeable streams in a
structured manner.

## Features

Implemented Streams include Console and TSV, to create others simply use an
existing as a template. The only requirements are they must act like a writeable
stream and have a  `format` function which formats the data according to the
requirements of the new logger.

## Installation

```bash

npm install Revere
```

## Usage

```js

/*
 * Dependencies 
 */
var revere = require('revere');

/*
 * Create `revere` instance with `name`
 */

var revTsv = revere('example_tsv_logger');

/*
 * Connect to a socketIO server and listen for status events
 */

revTsv.connect('status','http://localhost:3000');

/*
 * register console logger
 * this uses `debug` as the console logger so set the `DEBUG` enviroment
 * variable to `console` as the default.
 *
 * > `DEBUG=console node console.js`
 */

revTsv.registerLogger(revere.tsvLogger());

/*
 * Register cusomized `tsvLogger`
 */

revTsv.registerLogger(revere.tsvLogger({
    path: './out',
    name: 'output',
    ext: 'tsv',
    freq: '10s',
    retention: 5,
    ts_format: 'YYYYMMDD_HHmmss',
    ts_output_format: 'DD/MM/YYYY HH:mm:ss'
}));

```

View the examples directory for other usages.

## License

MIT
