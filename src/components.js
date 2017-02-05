const { CAFClient } = require('./client')

function injectClient (clientParams) {
  const client = new CAFClient(clientParams)
  return function (req, res, next) {
    req.client = client
    next()
  }
}

function ping ({ codePostal, numeroAllocataire }) {
  return function (req, res, next) {
    req.client.getAll(codePostal, numeroAllocataire, err => {
      if (err) return next(err)
      return res.send('pong')
    })
  }
}

function fetch () {
  return function (req, res, next) {
    const { codePostal, numeroAllocataire } = req.query

    req.client.getAll(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      return res.send(data)
    })
  }
}

module.exports = { ping, injectClient, fetch }
