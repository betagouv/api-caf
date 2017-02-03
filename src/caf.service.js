const request = require('request')
const fs = require('fs')
const UrlAssembler = require('url-assembler')
const parseXml = require('xml2js').parseString
const errors = require('./models/errors')
const StandardError = require('standard-error')

function buildQuery({ codePostal, numeroAllocataire }) {
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
</soap:Envelope>`;
}

class CafService {

  constructor(options) {
    this.options = options || {}
    this.sslCertificate = fs.readFileSync(options.cafSslCertificate)
    this.sslKey = fs.readFileSync(options.cafSslKey)
  }

  getQf(codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if(err) return callback(err)
      const doc = data['drtData']
      const allocataires = doc['identePersonnes'][0]['UNEPERSONNE'].map((item) => {
        return item['NOMPRENOM'][0]
      })
      const quotientData = doc['quotients'][0]['QFMOIS'][0]
      const quotientFamilial = Number.parseInt(quotientData['QUOTIENTF'][0])
      const mois = Number.parseInt(quotientData['DUMOIS'][0])
      const annee = Number.parseInt(quotientData['DELANNEE'][0])
      callback(null, {
        allocataires,
        quotientFamilial,
        mois,
        annee
      })
    })
  }

  getAdress(codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if(err) return callback(err)
      const doc = data['drtData']

      const allocataires = doc['identePersonnes'][0]['UNEPERSONNE'].map((item) => {
        return item['NOMPRENOM'][0]
      })
      const adress = doc['adresse'][0]
      const quotientData = doc['quotients'][0]['QFMOIS'][0]
      const mois = Number.parseInt(quotientData['DUMOIS'][0])
      const annee = Number.parseInt(quotientData['DELANNEE'][0])
      const adresse = {
        identite: adress['LIBLIG1ADR'][0],
        complementIdentite: adress['LIBLIG2ADR'][0],
        complementIdentiteGeo: adress['LIBLIG3ADR'][0],
        numeroRue: adress['LIBLIG4ADR'][0],
        lieuDit: adress['LIBLIG5ADR'][0],
        codePostalVille: adress['LIBLIG6ADR'][0],
        pays: adress['LIBLIG7ADR'][0]
      }

      callback(null, {
        adresse,
        allocataires,
        mois,
        annee
      })
    })
  }

  getFamily(codePostal, numeroAllocataire, callback) {
    this.getData({codePostal, numeroAllocataire}, (err, data) => {
      if(err) return callback(err)
      const doc = data['drtData']
      const allocataires = doc['identePersonnes'][0]['UNEPERSONNE'].map((item) => {
        return {
          nomPrenom: item['NOMPRENOM'][0],
          dateDeNaissance: item['DATNAISS'][0],
          sexe: item['SEXE'][0]
        }
      })
      const nodeEnfants = doc['identeEnfants'][0]['UNENFANT'] || [];
      const enfants = nodeEnfants.map((item) => {
        return {
          nomPrenom: item['NOMPRENOM'][0],
          dateDeNaissance: item['DATNAISS'][0],
          sexe: item['SEXE'][0]
        }
      })
      callback(null, {
        enfants,
        allocataires
      })
    })
  }

  getData({codePostal, numeroAllocataire, returnRawData}, callback) {
    const parameters = {
      typeEnvoi: 5,
      codePostal ,
      numeroAllocataire,
      typeDocument: 4
    }
    const queryWithParameters = buildQuery(parameters)
    const url = UrlAssembler(this.options.cafHost)
                  .template('/sgmap/wswdd/v1')
                  .toString()

    request
      .post({
        url: url,
        body: queryWithParameters,
        headers: { 'Content-Type': 'text/xml charset=utf-8' },
        gzip: true,
        cert: this.sslCertificate,
        key: this.sslKey,
        rejectUnauthorized: false,
        timeout: 10000
      }, (err, response, body) => {
        if (returnRawData) return callback(err, body)
        if (response.statusCode !== 200) return callback(new StandardError('Request error', { code: 500 }))

        parseXml(this.getFirstPart(body), (err, result) => {
          if(err) return callback(err)
          const returnData = result['soapenv:Envelope']['soapenv:Body'][0]['ns2:demanderDocumentWebResponse'][0]['return'][0]['beanRetourDemandeDocumentWeb'][0]
          const returnCode = returnData['codeRetour'][0]
          if(returnCode != 0) {
            const error = errors[returnCode]
            return callback(new StandardError(error.msg, { code: error.code }))
          }
          parseXml(returnData['fluxRetour'][0], (err, result) => {
            callback(err, result)
          })
        })
      })
  }

  hasBodyError(body){
    return body.indexOf('<codeRetour>0</codeRetour>') < 0
  }

  getFirstPart(body) {
    return this.getPart(1, body)
  }

  getPart(part, body) {
    var lines = body.split('\n')
    var separatorFound= 0
    var isHeader = false
    var newBody =''
    for(var line = 0; line < lines.length; line++){
      if(lines[line].indexOf('--MIMEBoundaryurn_uuid_') === 0) {
        separatorFound++
        isHeader = true
      } else if (isHeader && lines[line].length === 1) {
        isHeader = false
      } else if (!isHeader && separatorFound === part) {
        newBody += lines[line]+'\n'
      }
    }
    return newBody
  }
}

module.exports = CafService
