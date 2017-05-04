const errors = require('./errors.json')
class ClientError extends Error {
  constructor (errorCode) {
    let errorEntry = errors[errorCode]
    if (!errorEntry) {
      errorEntry = {
        code: 500,
        msg: 'Erreur serveur'
      }
    }
    const { msg, code } = errorEntry
    super(msg)
    this.code = code
  }
}
exports.ClientError = ClientError
