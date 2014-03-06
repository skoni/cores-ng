var Path = require('path');
var Fs = require('fs');
var Q = require('kew');
var Hapi = require('hapi');


module.exports = function setupServer(callback) {

  var server = new Hapi.Server('127.0.0.1', 3333, {
    cors: true,
    payload: {
      maxBytes: 10 * 1024 * 1024
    }
  });

  Q.bindPromise(server.pack.require, server.pack)('cores-hapi', {
    dbUrl: 'http://localhost:5984/test-cores-ng',
    resourceDir: __dirname + '/resources',
    api: true,
    debug: true,
    syncDesign: true,
    context: {
      imagesUrl: '/test/public/upload/'
    }

  }).then(function() {
    // logging
    server.on('response', function(req) {
      console.log(req.raw.res.statusCode, req.method.toUpperCase(), req.path);
    });
    server.on('internalError', function(req, error) {
      console.log('ERROR', error);
    });

    server.route([
      // index
      {
        path: '/',
        method: 'GET',
        handler: { file: './test/public/index.html' }
      },
      // static files
      {
        path: '/{path*}',
        method: 'GET',
        handler: { directory: { path: '.', listing: true }}
      }
    ]);

    // app data
    var app = server.pack.app = {
      upload: {
        dir: Path.join(__dirname, '/public/upload'),
        url: '/test/public/upload/'
      }
    };

    // image resource handlers
    function imageHandler(payload) {
      var doc = payload;

      if (payload.isMultipart) {

        var numFiles = parseInt(payload.numFiles, 10);
        doc = payload.doc;

        // multipart with fake files when testing
        if (doc.isTest) {
          for (var i = 0; i < numFiles; ++i) {
            doc['file' + i] = JSON.parse(payload['file' + i]);
          }
          return Q.resolve(doc);
        }

        if (numFiles > 0) {
          var buffer = payload['file0'];
          var destFile = app.upload.dir + '/' + doc.file.name;
          var defer = Q.defer();

          Fs.writeFile(destFile, buffer, function(err) {
            if (err) return defer.reject(err);
            doc.file.url = doc.file.name;
            return defer.resolve(doc);
          });

          return defer.promise;
        }
      }
      return Q.resolve(doc);
    };

    server.plugins['cores-hapi'].pre.create('Image', function(payload) {
      return imageHandler(payload);
    });

    server.plugins['cores-hapi'].pre.update('Image', function(payload) {
      return imageHandler(payload);
    });

    // create upload dir
    var defer = Q.defer();
    Fs.mkdir(app.upload.dir, function(err) {
      if (err && err.code !== 'EEXIST') return defer.reject(err);
      server.start(function(err) {
        if (err) return defer.reject(err);
        defer.resolve();
      });
    });
    return defer.promise;

  }).then(function() {
    callback();
  }, function(err) {
    callback(err);
  });
};
