/**
 * Bash helpers, wrapped in grunt exec tasks
 * Used in quests for memory leaks.
 *
 * cronOn/cronOff will overwirte user crontab, use it gently
 */

'use strict';

var writer = 'test/madPrinter.sh';

var sendUSR2 = [
  "$(which kill)",
  "-SIGUSR2",
  "$(",
  "ps -eo pid,cmd | egrep -o",
  "'([0-9]+) node .*grunt (--verbose )?(watch|leak)$'",
  "| awk {'print $1'}",
  ")"
];

var stopWriter = sendUSR2.slice();
stopWriter[1] = "-SIGTERM";
stopWriter[4] = "'[0-9]+ /.*sh " + writer + "'";

module.exports = {
  // Dump HeapDiff
  dumpDiff: {
    command: sendUSR2.join(' ')
  },

  // Dump HeapDiff from cron each 10 min.
  cronOn: {
    command: [].concat(['echo',
      '"*/10 * * * *'],
      sendUSR2, '"',
      ["| crontab -"],
      ["; crontab -l"]).join(' ')
  },
  
  // Off cron dumping
  cronOff: {
    command: 'crontab -r'
  },
  
  // Fire `watch` once
  writerOnce: {
    command: 'touch <%= watch.leak.files %>'
  },

  // Fire `watch` infinitely
  writerOn: {
    command: writer + ' <%= watch.leak.files %> &'
  },

  // Stop firing `watch`
  writerOff: {
    command: stopWriter.join(' ')
  }
};
