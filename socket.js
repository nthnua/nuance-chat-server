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
  let messageQueue = []
  let recieverQueue = []
  io.on('connection', socket => {
    console.log(recieverQueue)
    const user = new User()
    user.setSocketId(socket.id, socket.userId).then().catch(err => console.err(err))
    // socket.on('join', ({ chatId }) => {
    //   socket.join(chatId)
    //   socket.on('chatMessage', data => {

    //     console.log('Sending ', data)
    //     socket.to(chatId).emit('chatMessage', data)
    //   })
    // })
    if (recieverQueue.indexOf(socket.userId) !== -1) {
      messageQueue.forEach((message, index) => {
        if (message.reciever === socket.userId) {
          console.log('Sending pending msgs')
          socket.emit('chatMessage', message)
          console.log(messageQueue)
        }
      })
      // filter(message => message.reciever === socket.userId)
      // for (msg of pendingMsgs) {
      //   console.log('Sending pending msgs')
      //   socket.emit('chatMessage', msg)
      //   messageQueue = messageQueue.filter(message => message.mId !== msg.mId)
      // }
    }
    socket.on('chatMessage', data => {
      socket.emit('messageDelivery', {
        mId: data.mId,
        status: 1
      })
      user.getSocketId(data.reciever).then(({ socketId }) => {
        if (socketId === '') {
          console.log('User offline adding to queue')
          messageQueue.push(data)
          if (recieverQueue.indexOf(data.reciever) === -1)
            recieverQueue.push(data.reciever)
        }
        else {
          console.log('Sending ', data.content, 'to', socketId)
          const message = new Message(data.sender, data.reciever, data.content)
          message.save().then(() => {
            socket.emit('messageDelivery', {
              mId: data.mId,
              status: 2
            })
            socket.to(socketId).emit('chatMessage', data)
          }).catch(err => console.err(err))
        }
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
