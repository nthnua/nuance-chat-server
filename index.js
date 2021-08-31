const express = require('express')
const cors = require('cors')
const { ExpressPeerServer } = require('peer')
require('dotenv').config()

const login = require('./controllers/user').login
const signup = require('./controllers/user').signup
const lounge = require('./controllers/lounge').lounge
const auth = require('./controllers/auth').auth
const mongoConnect = require('./util/db').mongoConnect
const app = express()

// enable cross origin resource sharing
app.use(cors())
// parse json body
app.use(express.json())

// handle post for login route
app.post('/api/login', login)
app.post('/api/signup', signup)
app.get('/api/lounge', auth, lounge)

mongoConnect(client => {
  const server = app.listen(8000)
  // peerjs server
  const peerServer = ExpressPeerServer(server)
  app.use('/peer', peerServer)
})
