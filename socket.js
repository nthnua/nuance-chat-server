const Message = require('./models/message')
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
      socket.emit('messageDelivery', {
        mId: data.mId,
        status: 1
      })
      user.getSocketId(data.reciever).then(({ socketId }) => {
        console.log('Sending ', data.content, 'to', socketId)
        const message = new Message(data.sender, data.reciever, data.content)
        message.save().then(() => {
          socket.emit('messageDelivery', {
            mId: data.mId,
            status: 2
          })
          socket.to(socketId).emit('chatMessage', data)
        }).catch(err => console.err(err))
      }).catch(err => {
        console.error(err)
      })
    })
    socket.on('disconnect', () => {
      user.setSocketId('', socket.userId)
    })
  })
}

exports.sockets = sockets
