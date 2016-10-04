const http = require('http')
const express = require('express')
const StandardError = require('standard-error')
const expressBunyanLogger = require('express-bunyan-logger')
const bodyParser = require('body-parser')
const cors = require('cors')
const formatFromUrl = require('./lib/middlewares/formatFromUrl')
const loggerProperties = require('./lib/middlewares/logger')
const formatError = require('./lib/middlewares/formatError')
const caf = require('./src')

module.exports = Server;

function Server ({config, logger}) {

  var app = express();
  app.set('port', config.port);
  app.set('json spaces', 2);
  app.set('logger', logger);

  app.disable('x-powered-by');
  app.use(express.static('public'));
  app.use(bodyParser.json());
  var corsOptions = {
    exposedHeaders: ['Range', 'Content-Range', 'X-Content-Range'],
    credentials: true,
    origin: function (origin, callback) {
      logger.info('using cors origin', origin);
      callback(null, true);
    }
  };
  app.use(cors(corsOptions));

  app.use(expressBunyanLogger({
    name: 'requests',
    logger: logger,
    excludes: loggerProperties.excludes,
    includesFn: loggerProperties.includesFn,
    format: '":remote-address :incoming :method HTTP/:http-version :status-code :res-headers[content-length] :referer :user-agent[family] :user-agent[major].:user-agent[minor] :user-agent[os] :response-time ms";'
  }));

  app.use((req, res, next) => {
    req.logger = logger;
    next();
  })

  app.use(formatFromUrl)

  app.use('/api', caf(config));

  app.use(function notFound(req, res, next) {
    next(new StandardError('no route for URL ' + req.url, {code: 404}));
  });

  app.use(formatError);

  this.getPort = function() {
    return this.port;
  };

  var server = http.createServer(app);
  this.start = (onStarted) => {
    server.listen(app.get('port'), function (error) {
      if (error) {
        logger.error({error: error}, 'Got error while starting server');
        return onStarted(error);
      }
      this.port = server.address().port;
      app.set('port', this.port);
      logger.info({
        event: 'server_started',
        port: this.port
      }, 'Server listening on port', this.port);
      onStarted();
    });
  };

  this.stop = function (onStopped) {
    logger.info({
      event: 'server_stopping'
    }, 'Stopping server');
    server.close(function (error) {
      if (error) {
        logger.error({error: error}, 'Got error while stopping server');
        return onStopped(error);
      }
      logger.info({
        event: 'server_stopped'
      }, 'server stopped');
      onStopped();
    });
  }
}
