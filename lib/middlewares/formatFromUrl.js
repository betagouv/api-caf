'use strict';

const formatsDict = {
  xml: 'application/xml',
  json: 'application/json'
}

module.exports = function (req, res, next) {
  req.headers.accept = req.query.format ? formatsDict[req.query.format] : formatsDict.json
  next()
}
