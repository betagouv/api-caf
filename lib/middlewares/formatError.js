const StandardError = require('standard-error');
const { STATUS_CODES } = require('http');

module.exports = function (err, req, res, next) {
  req.logger.error({ error: err }, err.message);
  if (err.code) {
    if (err instanceof StandardError) {
      const error = {
        error: STATUS_CODES[err.code],
        reason: err.message
      }
      return res.status(err.code).send(error);
    }
  }
  next(err);
}
