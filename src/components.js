const { Client, ClientError } = require('./client')

function injectClient (clientParams) {
  const client = new Client(clientParams)
  return function (req, res, next) {
    req.client = client
    next()
  }
}

function ping ({ codePostal, numeroAllocataire }) {
  return function (req, res) {
    req.client.getAll(codePostal, numeroAllocataire, err => {
      if (err) return res.status(500).send('boom')
      return res.send('pong')
    })
  }
}

function fetch () {
  return function (req, res, next) {
    const { codePostal, numeroAllocataire } = req.query

    req.client.getAll(codePostal, numeroAllocataire, (err, data) => {
      if (err && err instanceof ClientError) {
        return res.status(err.code).send({ code: err.code, message: err.message })
      }
      if (err) return next(err)
      return res.send(data)
    })
  }
}

module.exports = { ping, injectClient, fetch }
