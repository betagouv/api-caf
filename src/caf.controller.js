const { CAFClient } = require('./client')

module.exports = CafController

function CafController ({ pingParams, serviceParams }) {
  const cafClient = new CAFClient(serviceParams)

  this.ping = function (req, res, next) {
    const { codePostal, numeroAllocataire } = pingParams
    cafClient.getAll(codePostal, numeroAllocataire, err => {
      if (err) return next(err)
      return res.send('pong')
    })
  }

  this.getAll = function (req, res, next) {
    var codePostal = req.query.codePostal
    var numeroAllocataire = req.query.numeroAllocataire
    cafClient.getAll(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      return res.send(data)
    })
  }
}
