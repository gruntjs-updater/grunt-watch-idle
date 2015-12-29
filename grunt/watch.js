'use strict';

module.exports = {
  jshint: {
    files: [
      '<%= jshint.grunt.src %>',
      '<%= jshint.task.src %>',
      '<%= jshint.test.src %>'
    ],
    tasks: ['jshint']
  },
  leak: {
    files: 'test/useless.tmp',
    tasks: ['jshint:task']
  }
};
