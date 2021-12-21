const express = require('express')
const cors = require('cors')
const http = require('http')
const auth = require('./controllers/auth').auth
const { mongoConnect } = require('./util/db')
const { sockets } = require('./socket')
const { Login, Signup, VerifyMail, Logout, requestResetPassword, setNewPassword } = require('./controllers/user')
const { userValidationRules, validate } = require('./util/validator')

require('dotenv').config()

const app = express()
const server = http.createServer(app)

// for socket.io
sockets(server)

// cross origin resource sharing
app.use(cors())

// parse json body
app.use(express.json())

app.post('/api/login', Login)
app.post('/api/signup', userValidationRules(), validate, Signup)
app.get('/api/verifymail', VerifyMail)

// app.get('/api/chats/:id', auth, getChats)
app.post('/api/logout', auth, Logout)
app.post('/api/resetpassword', requestResetPassword)
app.get('/api/setnewpassword', setNewPassword)
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
