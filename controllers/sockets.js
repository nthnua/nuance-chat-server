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
  // send undelivered messages on load complete
  // if sent earlier it can't be mapped to respective contacts
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
// when the user connects or logs in
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
  // acknowledgement is sent with undelivered status and id
  // helpful if/when showing mesage status on the client
  sendAck({
    _id: data._id,
    status: data.status
  })
  user.getSocketId(data.reciever).then(({ socketId }) => {
    const message = new Message(data._id, data.sender, data.reciever, data.content, data.status, data.type)
    message.save().then(() => {
      socket.to(socketId).emit('chatMessage', data)
    }).catch(err => console.error(err))
  }).catch(err => {
    console.error(err)
  })
}
const onDelivery = (data, socket) => {
  if (data.status === 2) {
    const message = new Message()
    const user = new User()
    message.updateStatus(data._id, 2).then().catch(err => console.error(err))
    user.getSocketId(data.sender).then(({ socketId }) => {
      // check if the socket is online if yes send delivery reports
      if (socketId) {
        // if the user gets disconnected at this point
        // the delivery report is lost
        // as acknowledgements are not supported when broadcasting.
        // more work is required to guarantee message delivery report's delivery
        // status code 2 represents message has been sent to the recipient
        socket.to(socketId).emit('messageDelivery', {
          _id: data._id,
          status: 2
        })
        // status code 3 represents message delivery acknowlegde is sent to the sender
        message.updateStatus(data._id, 3).then().catch(err => console.error(err))
      }
    })
  }
}
const onFriendRequest = (data, sendAck, socket) => {
  // friend requests are special messages where,
  // from and to represent the friend request's sender
  // and recipient respectively and message is of type 'friendRequest'
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

const onAcceptFriendRequest = (data, socket) => {
  const chatUser = new ChatUser()
  const user = new User()
  // when the recipient accepts the friend request
  // add the senders contact to recipient's contact list and vice versa then
  // send the the contact info of recipient to the sender
  chatUser.addContacts(socket.userId, data.reciever).then(() => {
    chatUser.addContacts(data.reciever, socket.userId).catch(err => { console.error(err) })
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
// send messages in batch when requested by the client
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

const onSearchContact = (data, socket) => {
  const { searchQuery } = data
  if (searchQuery) {
    new User().getUsers(searchQuery).toArray().then((users) => {
      socket.emit('searchResults', {
        searchResults: users
      })
    })
  }
}

module.exports = {
  onDelivery,
  onChatMessage,
  onGetChats,
  onFriendRequest,
  onAcceptFriendRequest,
  onInitialLoadComplete,
  onInitialConnection,
  onSearchContact,
  Auth
}
