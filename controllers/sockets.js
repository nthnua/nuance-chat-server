const jwt = require('jsonwebtoken')
const { createHash } = require('crypto')
const User = require('../models/user')
const Message = require('../models/message')
const ChatUser = require('../models/chatUser')

const Auth = (socket, next) => {
  const token = socket.handshake.auth.token
  const secret = process.env.AUTH_TOKEN_SECRET
  jwt.verify(token, secret, (err, decoded) => {
    if (decoded) {
      console.log(decoded.userId + ' Connected')
      socket.userId = decoded.userId
      const user = new User()
      // due to new direction of the project multilogin support is disabled indefinately
      // create a hash of jwt given to the client to compare
      // against an array of hashes in user database
      const hash = createHash('sha1').update(token).digest('base64')
      user.getSessions(decoded.userId).then(
        result => {
          if (result && result.sessions.includes(hash)) {
            console.log('req authed')
            socket.userId = decoded.userId
            return next()
          } else {
            return next(new Error('Unauthorized'))
          }
        }
      ).catch(err => console.error(err))
    } else {
      console.error(err)
      return next(new Error('Unauthorized'))
    }
  })
}

const onInitialLoadComplete = (socket) => {
  const message = new Message()
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
}
const onInitialConnection = (socket) => {
  const onInitAck = (ackData) => {
    console.log('Acked at ', ackData)
    const user = new User()
    user.setSocketId(socket.id, socket.userId).catch(err => console.error(err))
  }
  const chatUser = new ChatUser(socket.userId)
  chatUser.getContacts().then(contacts => {
    console.log('Sending contacts', contacts)
    socket.emit('initialContacts', contacts, onInitAck)
  }).catch(err => console.error(err))
}

const onChatMessage = (data, sendAck, socket) => {
  const user = new User()
  data._id = Math.ceil(Math.random() * 1000000000000)
  data.status = 1
  sendAck({
    _id: data._id,
    status: data.status
  })
  user.getSocketId(data.reciever).then(({ socketId }) => {
    console.log('Sending ', data.content, 'to', socketId)
    const message = new Message(data._id, data.sender, data.reciever, data.content, data.status, data.type)
    message.save().then(() => {
      socket.to(socketId).emit('chatMessage', data)
    }).catch(err => console.error(err))
  }).catch(err => {
    console.error(err)
  })
}
const onDelivery = (data, socket) => {
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
}
const onFriendRequest = (data, sendAck, socket) => {
  // const user = new User()
  // user.saveFriendRequest(data,)
  const user = new User()
  data._id = Math.ceil(Math.random() * 1000000000000)
  data.status = 1
  sendAck({
    _id: data._id,
    status: data.status
  })
  user.getSocketId(data.reciever).then(({ socketId }) => {
    console.log('Sending ', data.content, 'to', socketId)
    const message = new Message(data._id, data.sender, data.reciever, data.content, data.status, data.type)
    message.save().then(() => {
      socket.to(socketId).emit('friendRequest', data)
    }).catch(err => console.error(err))
  }).catch(err => {
    console.error(err)
  })
}
const onAcceptRequest = (data, socket) => {
  const chatUser = new ChatUser()
  const user = new User()
  chatUser.addContacts(socket.userId, data.reciever).then(() => {
    user.getName(socket.userId).then(({ realName }) => {
      socket.to(data.reciever).emit('newContact',
        {
          id: socket.userId,
          chats: [

          ],
          name: realName
        }
      )
    })
  }).catch(err => console.error(err))
}
const onGetChats = (data, socket) => {
  const sender = data.chatId
  const reciever = socket.userId
  const message = new Message()
  message.getMessages(sender, reciever).toArray().then(
    (messages) => {
      messages.reverse()
      socket.emit('batchMessages', { messages })
    }
  ).catch(err => console.log(err))
}

exports.onDelivery = onDelivery
exports.onChatMessage = onChatMessage
exports.onGetChats = onGetChats
exports.onFriendRequest = onFriendRequest
exports.onAcceptRequest = onAcceptRequest
exports.onInitialLoadComplete = onInitialLoadComplete
exports.onInitialConnection = onInitialConnection
exports.socketsAuth = Auth
