const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
const Server = require('./server')
const http = require('http')
const url = require('url')
const config = require('./config.json')

const logger = bunyan.createLogger({
  name: config.appname,
  level: config.log.level,
  stream: bunyanFormat({
    outputMode: config.log.format
  })
})

const mhttp = require('http-measuring-client').create()
mhttp.mixin(http)
mhttp.on('stat', function (parsed, stats) {
  logger.info({
    parsedUri: parsed,
    stats: stats
  }, '%s %s took %dms (%d)', stats.method || 'GET', url.format(parsed), stats.totalTime, stats.statusCode);
});

const server = new Server({
  config: config,
  logger: logger,
});

server.start(function (err) {
  if (err) {
    logger.fatal({error: err}, 'cannot recover from previous errors. shutting down now. error was', err.stack);
    setTimeout(process.exit.bind(null, 99), 10);
  }
  logger.info('Sever successfully started.');
});
