const StandardError = require('standard-error')
const CafService = require('./caf.service')

module.exports = CafController

function CafController ({ pingParams, serviceParams }) {
  const cafService = new CafService(serviceParams)

  this.ping = function (req, res, next) {
    const { codePostal, numeroAllocataire } = pingParams
    cafService.getAll(codePostal, numeroAllocataire, err => {
      if (err) return next(err)
      return res.send('pong')
    })
  }

  this.getAll = function (req, res, next) {
    var codePostal = req.query.codePostal
    var numeroAllocataire = req.query.numeroAllocataire
    cafService.getAll(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      return res.send(data)
    })
  }
}
