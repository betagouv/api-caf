const express = require('express')
const StandardError = require('standard-error')
const morgan = require('morgan')
const cors = require('cors')
const caf = require('./src')
const fs = require('fs')

function createServer ({ config, logger }) {
  const app = express()
  app.set('json spaces', 2)
  app.disable('x-powered-by')

  app.use(cors())
  app.use(morgan('dev'))

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

  app.use(function (err, req, res, next) {
    console.error(err)
    res.status(500).send({
      code: 500,
      message: err.message
    })
  })

  return app
}

module.exports = createServer
