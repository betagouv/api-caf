const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
const createServer = require('./server')
const config = require('./config.json')

const logger = bunyan.createLogger({
  name: config.appname,
  level: config.log.level,
  stream: bunyanFormat({
    outputMode: config.log.format
  })
})

const server = createServer({
  config: config,
  logger: logger
})

server.listen(config.port, () => {
  logger.info('Service started listing on port ' + config.port)
})
