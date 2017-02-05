# API CAF

Accéder simplement aux informations concernant une famille allocataire de la [CAF](http://www.caf.fr/).

## Informations pouvant être obtenues

* Quotient familial
* Adresse connue
* Nom, prénom, sexe et date de naissance des allocataires
* Nom, prénom, sexe et date de naissance des enfants à charge

Ces informations sont délivrées de façon sécurisée, sur la base du numéro d'allocataire et du code postal.

Les données sont mises à jour de façon mensuelle.

## Installation et utilisation

### Pré-requis

* [Node.js](https://nodejs.org) version 6 ou supérieure
* [yarn](https://yarnpkg.com)

### Configuration

Pour utiliser ce projet, vous devez créer un fichier `config.json`. Vous pouvez pour cela vous inspirer du fichier `config.example.json`.

| Clé | Description | Exemple |
| --- | --- | --- |
| `port` | Port d'écoute du serveur HTTP | `5000` (valeur par défaut) |
| `cafHost` | Hôte du service CAF | `https://caf-host` |
| `cafSslCertificate` | Chemin vers le certificat permettant de se connecter au service CAF | `/path/to/cert` |
| `cafSslKey` | Chemin vers la clé permettant de se connecter au service CAF | `/path/to/key` |
| `cafPingParams.numeroAllocataire` | Numéro d'allocataire à utiliser pour le service de PING | `1234567` |
| `cafPingParams.codePostal` | Code postal à utiliser pour le service de PING | `12345` |

### Installation des dépendances

```bash
yarn
```

### Lancement du service

```bash
yarn start
```

### Lancer les tests

```bash
yarn test
```

## Documentation de l'API

**Pour obtenir les informations concernant une famille :**

*Requête :*

`GET /api/famille?numeroAllocataire=123456&codePostal=92330`

*Réponse :*

```json
{
  "allocataires": [
    {
      "nomPrenom": "ALICE DUPONT",
      "dateDeNaissance": "01011980",
      "sexe": "F"
    },
    {
      "nomPrenom": "FRANCIS DUPONT",
      "dateDeNaissance": "01011984",
      "sexe": "M"
    }
  ],
  "enfants": [
    {
      "nomPrenom": "BOB DUPONT",
      "dateDeNaissance": "01012005",
      "sexe": "M"
    }
  ],
  "adresse": {
    "identite": "Madame ALICE DUPONT",
    "complementIdentiteGeo": "ENTREE C",
    "numeroRue": "9 IMPASSE DES ACACIAS",
    "codePostalVille": "92330 SCEAUX",
    "pays": "FRANCE"
  },
  "quotientFamilial": 1850,
  "mois": 1,
  "annee": 2017
}
```

**Pour vérifier la disponibilité du service**

*Requête :*

`GET /api/ping`

*Réponse :*

* `pong` si le service fonctionne
* `boom` sinon
