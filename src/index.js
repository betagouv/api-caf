const express = require('express')
const { ping, injectClient, fetch } = require('./components')

module.exports = function ({ serviceParams, pingParams }) {
  const router = express.Router()

  router.use(injectClient(serviceParams))

  router.get('/ping', ping(pingParams))
  router.get('/famille', fetch())

  return router
}
