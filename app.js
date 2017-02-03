const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
const Server = require('./server')
const config = require('./config.json')

const logger = bunyan.createLogger({
  name: config.appname,
  level: config.log.level,
  stream: bunyanFormat({
    outputMode: config.log.format
  })
})

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
