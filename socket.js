const sockets = (server) => {
  const { Server } = require('socket.io')

  const { socketsAuth } = require('./controllers/sockets')
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: '*'
    }
  })

  io.use(socketsAuth)

  io.on('connection', socket => {
    console.log('user connected', socket.id)
    socket.on('chatMessage', data => {
      console.log(data)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

exports.sockets = sockets
