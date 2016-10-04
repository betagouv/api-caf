'use strict';

module.exports.excludes = ['req', 'res', 'req-headers', 'res-headers', 'msg', 'url', 'short-body', 'body']

module.exports.includesFn = function(req) {
  let url = (req.baseUrl || '') + String(req.url || '')
  url = url.replace(/([?&])API-Key=([^&]+)/, '$1API-Key=XXX')

  const consumer = req.consumer|| {}

  return {
    correlationId: req.id,
    consumer: {
      organisation: consumer.name,
      user: req.user
    },
    host: req.headers.host,
    url
  }
}
