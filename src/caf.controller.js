const StandardError = require('standard-error')
const CafService = require('./caf.service')

module.exports = CafController

function CafController ({ pingParams, serviceParams }) {
  const cafService = new CafService(serviceParams)

  this.ping = function (req, res, next) {
    const { codePostal, numeroAllocataire } = pingParams
    cafService.getFamily(codePostal, numeroAllocataire, err => {
      if (err) return next(err)
      return res.send('pong')
    })
  }

  this.getQf = function (req, res, next) {
    var codePostal = req.query.codePostal
    var numeroAllocataire = req.query.numeroAllocataire
    cafService.getQf(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      if (data.quotientFamilial === 0) {
        return next(new StandardError('Pas de QF sur cette période', {code: 404}))
      }
      return res.send(data)
    })
  }

  this.getAdress = function (req, res, next) {
    var codePostal = req.query.codePostal
    var numeroAllocataire = req.query.numeroAllocataire
    cafService.getAdress(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      return res.send(data)
    })
  }

  this.getFamily = function (req, res, next) {
    var codePostal = req.query.codePostal
    var numeroAllocataire = req.query.numeroAllocataire
    cafService.getFamily(codePostal, numeroAllocataire, (err, data) => {
      if (err) return next(err)
      return res.send(data)
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
