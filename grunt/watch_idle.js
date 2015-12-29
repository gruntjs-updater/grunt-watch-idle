/**
 * Long leak's detection
 * Sorry, no Windows version :(
 *
 * Usage:
 * grunt [--verbose] leak
 *
 * See also grunt exec task
 */

'use strict';

var fs = require('fs');
var envNS = 'GWIDL_'; // environment namespace

var memwatch = require('memwatch-next');
var hd; // memwatch HeapDiff
var GCforce = process.env[envNS + 'GCFORCE'] || false; // do gc() periodically?

var hitTimeout = process.env[envNS + 'TIMEOUT'] || 5000;
var hitCount = 0;
var GCthreshold = 10; // run gc() after this hitCount

/**
 * Stats files markers: pid and timestamp
 */
function statsFilePart() {
  var s = '_';
  return s + process.pid + s + new Date().getTime();
}

/**
 * Beautify stats json data if logstash not used
 */
var logstash = process.env[envNS + 'POSTPROCESS'] || false;

function beautify(data) {
  return logstash ? JSON.stringify(data) : JSON.stringify(data, null, 2);
}

function dumpStats(filename, data) {
  if (process.stdout.isTTY) {
    fs.writeFileSync(filename, data);
  } else {
    process.stdout.write(data + '\n');
  }
}

// dump HeapDiff into file
process.on('SIGUSR2', function() {
  dumpStats(
    'hd' + statsFilePart() + '.json',
    beautify(hd.end())
  );
  hd = new memwatch.HeapDiff();
});

// emitted on full GC with heap compaction by V8
/** 
memwatch.on('stats', function(stats) {
 dumpStats(
    'stats' + statsFilePart() + '.json',
    beautify(stats)
  );
});*/

memwatch.on('leak', function(info) {
  dumpStats(
    'leak' + statsFilePart() + '.json',
    beautify(info)
  );
});

module.exports = function(grunt) {
  grunt.event.once('watch', function() {
    hd = new memwatch.HeapDiff();
  });

  var action = function() {
    grunt.log.error(new Date(), 'action hit'.cyan);

    if (!GCforce) {
      return;
    }

    ++hitCount;

    if (hitCount >= GCthreshold) {
      hitCount = 0;
      grunt.verbose.writeln(new Date(), 'GC initiated'.yellow);
      memwatch.gc();
    }
  };

  return {
    fast: {
      timeout: hitTimeout,
      action: action
    }
  };
};
