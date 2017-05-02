const nock = require('nock')
const thenify = require('thenify')
const path = require('path')
const fs = require('fs')
const { expect } = require('chai')
const { Client } = require('../lib/client')
const parseXml = thenify(require('xml2js').parseString)

describe('new Client({ host, key, cert })', () => {
  const baseUrl = 'https://pep.caf.fr'
  const codePostal = '92330'
  const numeroAllocataire = '7681716'
  const key = fs.readFileSync(path.join(__dirname, '../certs/particulier-caf.key'))
  const cert = fs.readFileSync(path.join(__dirname, '../certs/particulier-caf.bundle.crt'))
  
  let client
  beforeEach(() => {
    client = new Client({ host: baseUrl, key, cert })
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  describe('.getAll(codePostal, numeroAllocataire)', () => {
    let target, recordedRequestBody, recordedClientCert, recordedClientKey
    beforeEach(() => {
      target = nock(baseUrl)
        .post('/sgmap/wswdd/v1', function (body) {
          recordedClientCert = this.cert
          recordedClientKey = this.key
          recordedRequestBody = body
          return true
        })
        .reply(200, exampleResponse(), {
          'Content-Type': 'multipart/related; boundary="MIMEBoundaryurn_uuid_D555A7429610CCCBBB1493716971820"; type="application/xop+xml"; start="<0.urn:uuid:9BA817A2C44B237B741493717501717@apache.org>"; start-info="text/xml"'
        })
    })

    it('returns a promise', () => {
      return client.getAll(codePostal, numeroAllocataire).then(() => {})
    })

    it('makes correct a request against the provided host', () => {
      // When
      return client.getAll(codePostal, numeroAllocataire)
        .then(() => {
          target.done()
        }).then(() => {
          const expected = exampleRequest()
          const actual = recordedRequestBody
          return Promise.all([
            parseXml(expected),
            parseXml(actual)
          ])
        }).then(([expected, actual]) => {
          expect(actual).to.deep.equal(expected)
        })
    })

    it('parses the responses correctly', () => {
      // Given
      const expected = {
        allocataires: [{
          nomPrenom: 'MARIE DUPONT',
          dateDeNaissance: '12111988',
          sexe: 'F'
        }, {
          nomPrenom: 'JEAN DUPONT',
          dateDeNaissance: '18101988',
          sexe: 'M'
        }],
        enfants: [{
          nomPrenom: 'BENJAMINE DUPONT',
          dateDeNaissance: '10082016',
          sexe: 'M'
        }],
        adresse: {
          identite: 'Madame MARIE DUPONT',
          complementIdentiteGeo: 'ESCALIER B',
          numeroRue: '123 RUE BIDON',
          codePostalVille: '12345 CONDAT',
          pays: 'FRANCE'
        },
        quotientFamilial: 1998,
        mois: 4,
        annee: 2017
      }
      // When
      return client.getAll(codePostal, numeroAllocataire)
        .then((actual) => {
          // Then
        })
    })

    it('uses the given client certificate and key', () => {
      // Given
        return client.getAll(codePostal, numeroAllocataire)
          .then((actual) => {
            // Then
            expect(recordedClientKey).to.equal(key)
            expect(recordedClientCert).to.equal(cert)
          })
    })
  })


  function exampleRequest () {
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

})

function removeXmlSpacing (xmlString) {
  return xmlString.replace(/>\s</mg, '><')
}
function exampleResponse () {
  return "--MIMEBoundaryurn_uuid_D555A7429610CCCBBB1493716971820\r\nContent-Type: application/xop+xml; charset=utf-8; type=\"text/xml\"\r\nContent-Transfer-Encoding: binary\r\nContent-ID: <0.urn:uuid:9BA817A2C44B237B741493717501717@apache.org>\r\n\r\n<?xml version='1.0' encoding='utf-8'?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\"><soapenv:Body><ns2:demanderDocumentWebResponse xmlns:ns2=\"http://v1.ws.wsdemandedocumentcafweb.cnaf/\"><return><beanRetourDemandeDocumentWeb><codeRetour>0</codeRetour><fluxRetour>&lt;?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n&lt;drtData>\n    &lt;adresse>\n        &lt;LIBLIG1ADR>Madame MARIE DUPONT&lt;/LIBLIG1ADR>\n        &lt;LIBLIG2ADR>&lt;/LIBLIG2ADR>\n        &lt;LIBLIG3ADR>ESCALIER B&lt;/LIBLIG3ADR>\n        &lt;LIBLIG4ADR>123 RUE BIDON&lt;/LIBLIG4ADR>\n        &lt;LIBLIG5ADR>&lt;/LIBLIG5ADR>\n        &lt;LIBLIG6ADR>12345 CONDAT&lt;/LIBLIG6ADR>\n        &lt;LIBLIG7ADR>FRANCE&lt;/LIBLIG7ADR>\n    &lt;/adresse>\n    &lt;identeEnfants>\n        &lt;UNENFANT>\n            &lt;NOMPRENOM>BENJAMINE DUPONT&lt;/NOMPRENOM>\n            &lt;DATNAISS>10082016&lt;/DATNAISS>\n            &lt;SEXE>M&lt;/SEXE>\n        &lt;/UNENFANT>\n    &lt;/identeEnfants>\n    &lt;identePersonnes>\n        &lt;UNEPERSONNE>\n            &lt;QUAL>Madame&lt;/QUAL>\n            &lt;NOMPRENOM>MARIE DUPONT&lt;/NOMPRENOM>\n            &lt;DATNAISS>12111988&lt;/DATNAISS>\n            &lt;SEXE>F&lt;/SEXE>\n        &lt;/UNEPERSONNE>\n        &lt;UNEPERSONNE>\n            &lt;QUAL>Monsieur&lt;/QUAL>\n            &lt;NOMPRENOM>JEAN DUPONT&lt;/NOMPRENOM>\n            &lt;DATNAISS>18101988&lt;/DATNAISS>\n            &lt;SEXE>M&lt;/SEXE>\n        &lt;/UNEPERSONNE>\n    &lt;/identePersonnes>\n    &lt;quotients>\n        &lt;QFMOIS>\n            &lt;DUMOIS>4&lt;/DUMOIS>\n            &lt;DELANNEE>2017&lt;/DELANNEE>\n            &lt;QUOTIENTF>1998&lt;/QUOTIENTF>\n        &lt;/QFMOIS>\n    &lt;/quotients>\n&lt;/drtData>\n</fluxRetour><libelleRetour>Votre demande est bien enregistrée. Un document vous sera adressé à votre domicile dans les prochains jours.</libelleRetour></beanRetourDemandeDocumentWeb></return></ns2:demanderDocumentWebResponse></soapenv:Body></soapenv:Envelope>\r\n--MIMEBoundaryurn_uuid_D555A7429610CCCBBB1493716971820--"
}
