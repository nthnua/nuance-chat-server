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
  // // these are dummy as
  // // TODO: use db to check if user has pending messages
  // const messageQueue = []
  // const recieverQueue = []
  io.on('connection', socket => {
    const user = new User()
    socket.on('Connected', () => {
      user.setSocketId(socket.id, socket.userId).then(() => {
        const message = new Message()
        console.log('yay', socket.userId)
        message.getUndeliveredMessages(socket.userId).forEach((message) => {
          socket.emit('chatMessage', message)
        })
        // Send delivery reports too
        // Delivery reports are best effort
        // Here it is guaranteed to deliver but when reporting immidiately after msg delivery it is not
        message.getDeliveredButNotAckdMsgs(socket.userId).forEach((fetchedMessage) => {
          socket.emit('messageDelivery', {
            _id: fetchedMessage._id,
            status: 2
          }, (ackdData) => {
            message.updateStatus(fetchedMessage._id, ackdData.status).then().catch(err => console.error(err))
          })
        })
      }).catch(err => console.error(err))
      // if (recieverQueue.indexOf(socket.userId) !== -1) {
      //   messageQueue.forEach((message, idx, msgQ) => {
      //     if (message.reciever === socket.userId) {
      //       console.log('Sending pending msgs')
      //       socket.emit('chatMessage', message)
      //       user.getSocketId(message.sender).then(({ socketId }) => {
      //         socket.to(socketId).emit('messageDelivery', {
      //           _id: message._id,

      //           status: 2
      //         })
      //       }).catch(err => console.error(err))
      //       msgQ.splice(idx, 1)
      //       console.log(messageQueue)
      //     }
      //   })
      //   // filter(message => message.reciever === socket.userId)
      //   // for (msg of pendingMsgs) {
      //   //   console.log('Sending pending msgs')
      //   //   socket.emit('chatMessage', msg)
      //   //   messageQueue = messageQueue.filter(message => message._id !== msg._id)
      //   // }
      // }
    })
    // socket.on('join', ({ chatId }) => {
    //   socket.join(chatId)
    //   socket.on('chatMessage', data => {

    //     console.log('Sending ', data)
    //     socket.to(chatId).emit('chatMessage', data)
    //   })
    // })
    socket.on('chatMessage', (data, sendAck) => {
      data._id = Math.ceil(Math.random() * 1000000000000)
      data.status = 1
      sendAck({
        _id: data._id,
        status: data.status
      })
      user.getSocketId(data.reciever).then(({ socketId }) => {
        // if (socketId === '') {
        //   console.log('User offline adding to queue')
        //   //messageQueue.push(data)
        //   //if (recieverQueue.indexOf(data.reciever) === -1) { recieverQueue.push(data.reciever) }
        // }
        console.log('Sending ', data.content, 'to', socketId)
        const message = new Message(data._id, data.sender, data.reciever, data.content, data.status)
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
        message.updateStatus(data._id, 2).then((data) => {
          console.log(data)
        }).catch(err => console.error(err))
        user.getSocketId(data.sender).then(({ socketId }) => {
          // check if the socket is online if yes send delivery reports
          if (socketId) {
            // if the user gets disconnected at this point
            // the delivery report is lost
            // as acknowledgements are not supported when broadcasting.
            // more work is required to guarantee message delivery report's delivery
            socket.to(socketId).emit('messageDelivery', {
              _id: data._id,
              status: 2
            })
            message.updateStatus(data._id, 3).then().catch(err => console.error(err))
          }
        })
      }
    })
    socket.on('disconnect', () => {
      user.setSocketId('', socket.userId)
    })
  })
}

exports.sockets = sockets
