const express = require('express')
const StandardError = require('standard-error')
const expressBunyanLogger = require('express-bunyan-logger')
const cors = require('cors')
const loggerProperties = require('./lib/middlewares/logger')
const formatError = require('./lib/middlewares/formatError')
const caf = require('./src')
const fs = require('fs')

function createServer ({ config, logger }) {
  const app = express()
  app.set('json spaces', 2)
  app.set('logger', logger)
  app.disable('x-powered-by')

  app.use(cors())

  app.use(expressBunyanLogger({
    name: 'requests',
    logger: logger,
    excludes: loggerProperties.excludes,
    includesFn: loggerProperties.includesFn,
    format: '":remote-address :incoming :method HTTP/:http-version :status-code :res-headers[content-length] :referer :user-agent[family] :user-agent[major].:user-agent[minor] :user-agent[os] :response-time ms";'
  }))

  app.use((req, res, next) => {
    req.logger = logger
    next()
  })

  app.use('/api', caf({
    serviceParams: {
      host: config.cafHost,
      cert: fs.readFileSync(config.cafSslCertificate),
      key: fs.readFileSync(config.cafSslKey)
    },
    pingParams: {
      codePostal: config.codePostal,
      numeroAllocataire: config.numeroAllocataire
    }
  }))

  app.use(function notFound (req, res, next) {
    next(new StandardError('no route for URL ' + req.url, {code: 404}))
  })

  app.use(formatError)

  return app
}

module.exports = createServer
