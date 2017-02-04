const express = require('express')
const Controller = require('./caf.controller')

const router = express.Router()

module.exports = function (options) {
  const cafController = new Controller(options)

  router.get('/famille', cafController.getAll)
  router.get('/ping', cafController.ping)

  return router
}
