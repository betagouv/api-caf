const thenify = require('thenify')
const { ClientError } = require('./error')
const request = require('request-promise-native')
const parseXml = thenify(require('xml2js').parseString)

class Client {
  constructor ({ host, cert, key }) {
    if (!host) throw new Error('host is required')

    this.host = host
    this.key = key
    this.cert = cert
  }

  getAll (codePostal, numeroAllocataire, done) {
    return this.getData({ codePostal, numeroAllocataire })
      .then((data) => parseAll(data))
  }

  getData ({ codePostal, numeroAllocataire }) {
    return request.post({
      url: `${this.host}/sgmap/wswdd/v1`,
      body: buildQuery({ codePostal, numeroAllocataire }),
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      gzip: true,
      cert: this.cert,
      key: this.key,
      rejectUnauthorized: false,
      timeout: 10000
    })
    .then((body) => {
      const realBody = extractRealBody(body)
      if (!realBody) throw Error('Request error')
      else return parseXml(realBody)
    })
    .then((result) => {
      return extractReturnValue(result)
    })
  }
}

function parseAll (rawData) {
  const rootElement = rawData['drtData']

  const allocataires = rootElement['identePersonnes'][0]['UNEPERSONNE'].map(parsePersonne)
  const enfants = (rootElement['identeEnfants'][0]['UNENFANT'] || []).map(parsePersonne)
  const adresse = parseAdresse(rootElement['adresse'][0])
  let quotient = {
    quotientFamilial: null,
    mois: null,
    annee: null
  }
  if (rootElement['quotients'].length > 0) {
    quotient = parseQuotient(rootElement['quotients'][0]['QFMOIS'][0])
  }

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
                    <matricule>${numeroAllocataire}</matricule>
                    <codePostal>${codePostal}</codePostal>
                    <typeDocument>4</typeDocument>
                    <typeEnvoi>5</typeEnvoi>
                </beanEntreeDemandeDocumentWeb>
            </arg0>
        </tns:demanderDocumentWeb>
    </soap:Body>
</soap:Envelope>`
}

function extractReturnValue (result) {
  const returnData = result['soapenv:Envelope']['soapenv:Body'][0]['ns2:demanderDocumentWebResponse'][0]['return'][0]['beanRetourDemandeDocumentWeb'][0]
  const returnCode = Number(returnData['codeRetour'][0])
  if (returnCode !== 0) {
    throw new ClientError(returnCode)
  }
  return parseXml(returnData['fluxRetour'][0])
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

function extractValue (node, key) {
  if (!(key in node) || node[key].length === 0) return
  return node[key][0]
}

function isString (obj) {
  return typeof obj === 'string'
}

const parsePersonne = (rawData) => extractObject(rawData, {
  nomPrenom: 'NOMPRENOM',
  dateDeNaissance: 'DATNAISS',
  sexe: 'SEXE'
  // qualite: 'QUAL'
})

const parseAdresse = (rawData) => extractObject(rawData, {
  identite: 'LIBLIG1ADR',
  complementIdentite: 'LIBLIG2ADR',
  complementIdentiteGeo: 'LIBLIG3ADR',
  numeroRue: 'LIBLIG4ADR',
  lieuDit: 'LIBLIG5ADR',
  codePostalVille: 'LIBLIG6ADR',
  pays: 'LIBLIG7ADR'
})

const parseQuotient = (rawData) => extractObject(rawData, {
  mois: { src: 'DUMOIS', parse: parseInt },
  annee: { src: 'DELANNEE', parse: parseInt },
  quotientFamilial: { src: 'QUOTIENTF', parse: parseInt }
})


function extractRealBody (body) {
  const startPattern = '<?xml'
  const endPattern = '</soapenv:Envelope>'

  const startPos = body.indexOf(startPattern)
  const endPos = body.lastIndexOf(endPattern)

  if (startPos < 0 || endPos < 0 || startPos > endPos + endPattern.length) return
  return body.substring(startPos, endPos + endPattern.length)
}



module.exports = { Client, ClientError }
