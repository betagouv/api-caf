const request = require('request')
const parseXml = require('xml2js').parseString
const errors = require('./models/errors')
const StandardError = require('standard-error')

function buildQuery ({ codePostal, numeroAllocataire }) {
  return `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://v1.ws.wsdemandedocumentcafweb.cnaf/">
    <soap:Header/>
    <soap:Body>
        <tns:demanderDocumentWeb xmlns:tns="http://v1.ws.wsdemandedocumentcafweb.cnaf/">
            <arg0>
                <app>WDD</app>
                <id>?</id>
                <beanEntreeDemandeDocumentWeb>
                    <codeAppli>WDD</codeAppli>
                    <codePostal>${codePostal}</codePostal>
                    <matricule>${numeroAllocataire}</matricule>
                    <typeDocument>4</typeDocument>
                    <typeEnvoi>5</typeEnvoi>
                </beanEntreeDemandeDocumentWeb>
            </arg0>
        </tns:demanderDocumentWeb>
    </soap:Body>
</soap:Envelope>`
}

function isString (obj) {
  return typeof obj === 'string'
}

function extractValue (node, key) {
  if (!(key in node) || node[key].length === 0) return
  return node[key][0]
}

function extractObject (node, mapping) {
  const obj = {}
  Object.keys(mapping).forEach(key => {
    const def = isString(mapping[key]) ? { src: mapping[key] } : mapping[key]
    const value = extractValue(node, def.src)
    if (value) obj[key] = def.parse ? def.parse(value) : value
  })
  if (Object.keys(obj).length === 0) return
  return obj
}

const parsePersonne = rawData => extractObject(rawData, {
  nomPrenom: 'NOMPRENOM',
  dateDeNaissance: 'DATNAISS',
  sexe: 'SEXE'
  // qualite: 'QUAL'
})

const parseAdresse = rawData => extractObject(rawData, {
  identite: 'LIBLIG1ADR',
  complementIdentite: 'LIBLIG2ADR',
  complementIdentiteGeo: 'LIBLIG3ADR',
  numeroRue: 'LIBLIG4ADR',
  lieuDit: 'LIBLIG5ADR',
  codePostalVille: 'LIBLIG6ADR',
  pays: 'LIBLIG7ADR'
})

const parseQuotient = rawData => extractObject(rawData, {
  mois: { src: 'DUMOIS', parse: parseInt },
  annee: { src: 'DELANNEE', parse: parseInt },
  quotientFamilial: { src: 'QUOTIENTF', parse: parseInt }
})

const parseAll = rawData => {
  const rootElement = rawData['drtData']

  const allocataires = rootElement['identePersonnes'][0]['UNEPERSONNE'].map(parsePersonne)
  const enfants = (rootElement['identeEnfants'][0]['UNENFANT'] || []).map(parsePersonne)
  const adresse = parseAdresse(rootElement['adresse'][0])
  const quotient = parseQuotient(rootElement['quotients'][0]['QFMOIS'][0])

  const { quotientFamilial, mois, annee } = quotient

  return {
    allocataires,
    enfants,
    adresse,
    quotientFamilial,
    mois,
    annee
  }
}

function extractRealBody (body) {
  const startPattern = '<?xml'
  const endPattern = '</soapenv:Envelope>'

  const startPos = body.indexOf(startPattern)
  const endPos = body.lastIndexOf(endPattern)

  if (startPos < 0 || endPos < 0 || startPos > endPos + endPattern.length) return
  return body.substring(startPos, endPos + endPattern.length)
}

class CafService {

  constructor ({ host, cert, key }) {
    this.host = host
    this.key = key
    this.cert = cert
  }

  getAll (codePostal, numeroAllocataire, done) {
    this.getData({ codePostal, numeroAllocataire }, (err, data) => {
      if (err) return done(err)
      done(null, parseAll(data))
    })
  }

  getQf (codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if (err) return callback(err)
      const { allocataires, quotientFamilial, mois, annee } = parseAll(data)
      callback(null, { allocataires, quotientFamilial, mois, annee })
    })
  }

  getAdress (codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if (err) return callback(err)
      const { allocataires, adresse, mois, annee } = parseAll(data)
      callback(null, { allocataires, adresse, mois, annee })
    })
  }

  getFamily (codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if (err) return callback(err)
      const { allocataires, enfants } = parseAll(data)
      callback(null, { allocataires, enfants })
    })
  }

  getData ({ codePostal, numeroAllocataire }, callback) {
    request
      .post({
        url: `${this.host}/sgmap/wswdd/v1`,
        body: buildQuery({ codePostal, numeroAllocataire }),
        headers: { 'Content-Type': 'text/xml charset=utf-8' },
        gzip: true,
        cert: this.cert,
        key: this.key,
        rejectUnauthorized: false,
        timeout: 10000
      }, (err, response, body) => {
        const finishWithError = () => callback(new StandardError('Request error', { code: 500 }))
        if (err) return finishWithError()
        if (response.statusCode !== 200) return finishWithError()
        const realBody = extractRealBody(body)
        if (!realBody) return finishWithError()

        parseXml(realBody, (err, result) => {
          if (err) return callback(err)
          const returnData = result['soapenv:Envelope']['soapenv:Body'][0]['ns2:demanderDocumentWebResponse'][0]['return'][0]['beanRetourDemandeDocumentWeb'][0]
          const returnCode = parseInt(returnData['codeRetour'][0])
          if (returnCode !== 0) {
            const error = errors[returnCode]
            return callback(new StandardError(error.msg, { code: error.code }))
          }
          parseXml(returnData['fluxRetour'][0], (err, result) => {
            callback(err, result)
          })
        })
      })
  }

  hasBodyError (body) {
    return body.indexOf('<codeRetour>0</codeRetour>') < 0
  }
}

module.exports = CafService
