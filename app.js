const createServer = require('./server')
const config = require('./config.json')

const server = createServer({ config })

server.listen(config.port, () => {
  console.log('Start listening on port ' + config.port)
})
