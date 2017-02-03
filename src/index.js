const express = require('express')
const Controller = require('./caf.controller')

const router = express.Router()

module.exports = function (options) {
  const cafController = new Controller(options)

  router.get('/qf', cafController.getQf)
  router.get('/adresse', cafController.getAdress)
  router.get('/famille', cafController.getFamily)
  router.get('/ping', cafController.ping)

  return router
}
