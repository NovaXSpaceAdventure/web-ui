var fs = require('fs');

var inStr = fs.createReadStream('/your/path/to/file');
var outStr = fs.createWriteStream('/your/path/to/destination');

inStr.pipe(outStr);