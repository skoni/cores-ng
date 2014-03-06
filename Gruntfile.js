var path = require('path');
var nano = require('nano')('http://localhost:5984');


var dbName = 'test-cores-ng';


module.exports = function(grunt) {

  grunt.initConfig({
    karma: {
      run: {
        configFile: './test/karma.conf.js'
      }
    },

    ngtemplates: {
      cores: {
        src: 'templates/*.html',
        dest: 'templates/templates.js',
        options: {
          url: function(url) {
            return 'cr-' + url.replace('templates/', '');
          }
        }
      }
    },

    concat: {
      cores: {
        // order matters!
        src: ['lib/index.js',
              'templates/templates.js',
              'lib/filters/*.js',
              'lib/controllers/*.js',
              'lib/services/*.js',
              'lib/directives/*.js'],
        dest: 'cores.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['ngtemplates', 'concat']);

  grunt.registerTask('serve', ['db:create', 'server:run', 'db:destroy']);
  grunt.registerTask('test', ['db:create', 'server:test', 'karma', 'db:destroy']);

  //
  // server tasks
  //

  grunt.registerTask('server:run', 'start server', function() {
    var done = this.async();
    var startServer = require('./test/server.js');
    startServer(function(err) {
      if (err) console.log(err);
      console.log('server up');
    });
    // never call done to run endlessly
  });

  grunt.registerTask('server:test', 'start test server', function() {
    var done = this.async();
    var startServer = require('./test/server.js');
    startServer(done);
  });


  //
  // db tasks
  //

  grunt.registerTask('db:create', 'create test DB', function() {
    var done = this.async();

    // create db for testing
    nano.db.get(dbName, function(err, body) {
      if (!err) {
        // db exists, recreate
        nano.db.destroy(dbName, function(err) {
          if (err) done(err);
          nano.db.create(dbName, done);
        });
      }
      else if (err.reason === 'no_db_file'){
        // create the db
        nano.db.create(dbName, done);
      }
      else done(err);
    });
  });

  grunt.registerTask('db:destroy', 'destroy test DB', function() {
    var done = this.async();
    nano.db.destroy(dbName, done);
  });
};