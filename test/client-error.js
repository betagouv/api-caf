const proxyquire = require('proxyquire')
const { expect } = require('chai')

describe('new ClientError(cafErrorCode)', () => {
  const errorDictionary = {
    '101': {
      msg: "Un message d'erreur",
      code: 404
    },
    '102': {
      msg: "Un autre message d'erreur",
      code: 408
    }
  }
  let ClientError
  beforeEach(() => {
    ClientError = proxyquire('../lib/client/error', {
      './errors.json': errorDictionary
    }).ClientError
  })

  it('is an instance of Error', () => {
    // Given
    const code = '101'
    // When
    const actual = new ClientError(code)
    // Then
    expect(actual).to.be.an.instanceof(Error)
  })

  describe('when the code is known', () => {
    it('uses the message and http code from the dictionary', () => {
      // When
      const errorA = new ClientError('101')
      const errorB = new ClientError('102')
      // Then
      expect(errorA.message).to.equal("Un message d'erreur")
      expect(errorB.message).to.equal("Un autre message d'erreur")
      expect(errorA.code).to.equal(404)
      expect(errorB.code).to.equal(408)
    })
  })

  describe('when the code is not known', () => {
    it('uses a generic message and 500 code', () => {
      // When
      const error = new ClientError('808')
      // Then
      expect(error.message).to.equal('Erreur serveur')
      expect(error.code).to.equal(500)
    })
  })
})
