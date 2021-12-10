const express = require('express')
const cors = require('cors')
const http = require('http')
require('dotenv').config()
const login = require('./controllers/user').login
const signup = require('./controllers/user').signup
const lounge = require('./controllers/lounge').lounge
const auth = require('./controllers/auth').auth
const mongoConnect = require('./util/db').mongoConnect
const { sockets } = require('./socket')
const { logout, verifymail } = require('./controllers/user')
const app = express()
const server = http.createServer(app)
const { userValidationRules, validate } = require('./util/validator')

// for socket.io
sockets(server)

// cross origin resource sharing
app.use(cors())

// parse json body
app.use(express.json())

app.post('/api/login', login)
app.post('/api/signup', userValidationRules(), validate, signup)
app.get('/api/verifymail', verifymail)
app.get('/api/lounge', auth, lounge)
// app.post('/api/lounge', auth, setSocketId)
// app.get('/api/chats/:id', auth, getChats)
app.post('/api/logout', auth, logout)
app.use('/', (req, res) => {
  res.redirect(process.env.FRONTEND_ADDRESS)
})

mongoConnect(client => {
  let port = process.env.PORT
  if (!port) {
    port = 8000
  }
  server.listen(port, () => {
    console.log(`Listening on ${port}`)
  })

  // // peerjs server
  // const peerServer = ExpressPeerServer(server)
  // app.use('/peer', peerServer)
  // peerServer.on('connection', (conn) => {
  //   console.log('peer connected', conn.getId())
  // })
  // peerServer.on('disconnect', (disconn) => {
  //   console.log('peer disconnected', disconn.getId())
  // })
})
