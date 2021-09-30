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
    user.setSocketId(socket.id, socket.userId).then().catch(err => console.err(err))
    // socket.on('join', ({ chatId }) => {
    //   socket.join(chatId)
    //   socket.on('chatMessage', data => {

    //     console.log('Sending ', data)
    //     socket.to(chatId).emit('chatMessage', data)
    //   })
    // })
    socket.on('chatMessage', data => {
      user.getSocketId(data.reciever).then(({ socketId }) => {
        console.log('Sending ', data.content, 'to', socketId)
        socket.to(socketId).emit('chatMessage', data)
      }).catch(err => {
        console.error(err)
      })
    })
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

exports.sockets = sockets
