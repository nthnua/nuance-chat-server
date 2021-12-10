const User = require('./models/user')

const sockets = (server) => {
  const { Server } = require('socket.io')

  const { socketsAuth, onChatMessage, onDelivery, onInitialConnection, onGetChats, onFriendRequest, onInitialLoadComplete, onAcceptFriendRequest } = require('./controllers/sockets')
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
    // once the initial contact load is complete
    // client should fire the event 'loadComplete'
    // then all the undelivered messages to the client are delivered
    socket.on('loadComplete', () => {
      onInitialLoadComplete(socket)
    })
    // chat messages are messages with type: 'chatMessage'
    socket.on('chatMessage', (data, sendAck) => {
      onChatMessage(data, sendAck, socket)
    })
    socket.on('deliveryReport', (data) => {
      onDelivery(data, socket)
    })
    socket.on('getChats', (data) => {
      onGetChats(data, socket)
    })
    // friend requests are also treated as messages but with type: 'friendRequest'
    socket.on('friendRequest', (data, sendAck) => {
      onFriendRequest(data, socket)
    })
    socket.on('acceptFriendRequest', (data) => {
      onAcceptFriendRequest(data, socket)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected', socket.userId)
      user.setSocketId('', socket.userId)
    })
  })
}

exports.sockets = sockets
