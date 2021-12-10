const User = require('./models/user')

const sockets = (server) => {
  const { Server } = require('socket.io')

  const { socketsAuth, onChatMessage, onDelivery, onInitialConnection, onGetChats, onFriendRequest, onAcceptRequest, onInitialLoadComplete } = require('./controllers/sockets')
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: '*'
    }
  })
  // on first connection check if user is authorised
  io.use(socketsAuth)

  io.on('connection', socket => {
    const user = new User()
    // socket.on('initialConnection', () => {
    //   onInitialConnection(socket)
    // })
    onInitialConnection(socket)
    socket.on('loadComplete', () => {
      onInitialLoadComplete(socket)
    })
    socket.on('chatMessage', (data, sendAck) => {
      onChatMessage(data, sendAck, socket)
    })
    socket.on('deliveryReport', (data) => {
      onDelivery(data, socket)
    })
    socket.on('getChats', (data) => {
      onGetChats(data, socket)
    })
    socket.on('friendRequest', (data, sendAck) => {
      onFriendRequest(data, socket)
    })
    socket.on('acceptFriendRequest', (data) => {
      onAcceptRequest(data, socket)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected', socket.userId)
      user.setSocketId('', socket.userId)
    })
  })
}

exports.sockets = sockets
