const expect = require('chai').expect
const config = require('../../config.json')
const CafService = require('../caf.service')

const codePostal = 99227;
const caf = new CafService(config)

describe('Situations', () => {

  it('203362 - 1 personne sans enfant APL', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 203362, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('174569 - 1 personne sans enfant APL', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 174569, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('607693 - 1 personne sans enfant sous tutelle APL + AAH', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 607693, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('929249 - 1 personne sans enfant sous tutelle AAHL', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 929249, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('2925059 - 1 Couple 1 enfant AF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 2925059, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('366788 - 1 Couple 1 enfant AL + AEEH', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 366788, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('223285 - 1 Couple 3 enfants AF +CF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 223285, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('208898 - 1 Couple 3 enfants APL + AF + AB', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 208898, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('2976198 - 1 Couple 5 enfants ALF + APL + CF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 2976198, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('248051 - 1 personne 1enfant APL', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 248051, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('283044 - 1 personne 1enfant APL + ASF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 283044, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('998591 - 1 personne 1enfant ALF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 998591, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('857177 - 1 personne 2 enfants ALF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 857177, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('65131 - 1 personne 2 enfants APL + ALF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 65131, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('563323 - 1 personne 3 enfants AL + ASF', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 563323, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('254463 - Pas de droit', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 254463, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('127380 - Pas de droit', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 127380, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })

  it('213906 - Pas de droit', (done) => {
    return caf.getData({codePostal, numeroAllocataire: 213906, returnRawData: true}, (err, data) => {
      expect(err).to.be.null
      expect(data).to.exist
      done()
    })
  })
})
