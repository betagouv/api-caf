const errors = require('./errors.json')
class ClientError extends Error {
  constructor (errorCode) {
    const { msg, code } = errors[errorCode]
    super(msg)
    this.code = code
  }
}
exports.ClientError = ClientError
