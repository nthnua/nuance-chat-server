const User = require('./models/user')

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
    const user = new User()
    user.setSocketId(socket.id, socket.userId)
    socket.on('chatMessage', data => {
      socket.emit()
      io.to(data.reciever).emit('chatMessage', data)
      console.log(data)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

exports.sockets = sockets
