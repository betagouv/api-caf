const express = require('express')
const StandardError = require('standard-error')
const morgan = require('morgan')
const cors = require('cors')
const cafRouter = require('./src/router')
const fs = require('fs')
const config = require('./config.json')

const port = config.port || 3000
const app = express()

app.set('json spaces', 2)
app.disable('x-powered-by')

app.use(cors())
app.use(morgan('dev'))

app.use('/api', cafRouter({
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

app.use(function notFound (req, res) {
  res.status(404).send({ code: 404, message: `No route for ${req.url}` })
})

app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500).send({
    code: 500,
    message: err.message
  })
})

app.listen(port, () => {
  console.log('Start listening on port ' + port)
})
