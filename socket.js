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
  // these are dummy as
  // TODO: use db to check if user has pending messages
  const messageQueue = []
  const recieverQueue = []
  io.on('connection', socket => {
    const user = new User()
    socket.on('Connected', () => {
      user.setSocketId(socket.id, socket.userId).then().catch(err => console.err(err))
      if (recieverQueue.indexOf(socket.userId) !== -1) {
        messageQueue.forEach((message, idx, msgQ) => {
          if (message.reciever === socket.userId) {
            console.log('Sending pending msgs')
            socket.emit('chatMessage', message)
            user.getSocketId(message.sender).then(({ socketId }) => {
              socket.to(socketId).emit('messageDelivery', {
                mId: message.mId,
                status: 2
              })
            }).catch(err => console.error(err))
            msgQ.splice(idx, 1)
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
    })
    // socket.on('join', ({ chatId }) => {
    //   socket.join(chatId)
    //   socket.on('chatMessage', data => {

    //     console.log('Sending ', data)
    //     socket.to(chatId).emit('chatMessage', data)
    //   })
    // })
    socket.on('chatMessage', (data, sendAck) => {
      data.mId = Math.ceil(Math.random() * 1000000000000)
      data.status = 1
      sendAck({
        mId: data.mId,
        status: data.status
      })
      user.getSocketId(data.reciever).then(({ socketId }) => {
        // if (socketId === '') {
        //   console.log('User offline adding to queue')
        //   //messageQueue.push(data)
        //   //if (recieverQueue.indexOf(data.reciever) === -1) { recieverQueue.push(data.reciever) }
        // }
        console.log('Sending ', data.content, 'to', socketId)
        const message = new Message(data.mId, data.sender, data.reciever, data.content, data.status)
        message.save().then(() => {
          socket.to(socketId).emit('chatMessage', data)
        }).catch(err => console.error(err))
      }).catch(err => {
        console.error(err)
      })
    })
    socket.on('deliveryReport', (data) => {
      console.log(data)
      if (data.status === 2) {
        const message = new Message()
        const user = new User()
        console.log('updating status')
        message.updateStatus(data.mId, 2).then().catch(err => console.error(err))
        user.getSocketId(data.sender).then(({ socketId }) => {
          socket.to(socketId).emit('messageDelivery', {
            mId: data.mId,
            status: 2
          })
        })
      }
    })
    socket.on('disconnect', () => {
      user.setSocketId('', socket.userId)
    })
  })
}

exports.sockets = sockets
