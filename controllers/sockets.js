const jwt = require('jsonwebtoken')
const { createHash } = require('crypto')
const User = require('../models/user')
const Message = require('../models/message')

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
      user
        .getSessions(decoded.userId)
        .then((result) => {
          if (result && result.sessions.includes(hash)) {
            socket.userId = decoded.userId
            return next()
          } else {
            return next(new Error('Unauthorized'))
          }
        })
        .catch((err) => console.error(err))
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
  message
    .getDeliveredButNotAckdMsgs(socket.userId)
    .forEach((fetchedMessage) => {
      socket.emit(
        'messageDelivery',
        {
          _id: fetchedMessage._id,
          status: 2
        },
        (ackdData) => {
          message
            .updateStatus(fetchedMessage._id, ackdData.status)
            .then()
            .catch((err) => console.error(err))
        }
      )
    })
  // message.getFriendRequests(socket.userId).forEach((message) => {
  //   socket.emit('chatMessage', message)
  // })
}
// when the user connects or logs in
const onInitialConnection = (socket) => {
  const onInitAck = (ackData) => {
    const user = new User()
    user
      .setSocketId(socket.id, socket.userId)
      .catch((err) => console.error(err))
  }
  new User()
    .getContacts(socket.userId)
    .then((contacts) => {
      if (contacts) {
        socket.emit('initialContacts', contacts, onInitAck)
      }
    })
    .catch((err) => console.error(err))
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
  const message = new Message(
    data._id,
    data.sender,
    data.reciever,
    data.content,
    data.status,
    data.type
  )
  message
    .save().then(() => {
      user
        .getSocketId(data.reciever)
        .then((result) => {
          // if user is offline socket id will be ''
          if (result && result.socketId) {
            socket.to(result.socketId).emit('chatMessage', data)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }).catch(err => console.error(err))
}
const onLoadChatPart = async (data, socket) => {
  const message = new Message()
  const messages = await message
    .getPartialMessages(data.sender, data.reciever, 20, data.currentCount)
    .toArray()
  socket.emit('gotChatPart', {
    messages,
    reciever: data.reciever
  })
}
const onDelivery = (data, socket) => {
  if (data.status === 2) {
    const message = new Message()
    const user = new User()
    message
      .updateStatus(data._id, 2)
      .then()
      .catch((err) => console.error(err))
    user.getSocketId(data.sender).then((result) => {
      // check if the socket is online if yes send delivery reports
      if (result && result.socketId) {
        // if the user gets disconnected at this point
        // the delivery report is lost
        // as acknowledgements are not supported when broadcasting.
        // more work is required to guarantee message delivery report's delivery
        // status code 2 represents message has been sent to the recipient
        socket.to(result.socketId).emit('messageDelivery', {
          _id: data._id,
          status: 2
        })
        // status code 3 represents message delivery acknowlegde is sent to the sender
        message
          .updateStatus(data._id, 3)
          .then()
          .catch((err) => console.error(err))
      }
    })
  }
}
// const onFriendRequest = (data, sendAck, socket) => {
//   // friend requests are special messages where,
//   // from and to represent the friend request's sender
//   // and recipient respectively and message is of type 'friendRequest'
//   const user = new User()
//   data._id = Math.ceil(Math.random() * 1000000000000)
//   data.status = 1

//   sendAck({
//     _id: data._id,
//     status: data.status
//   })
//   user.getSocketId(data.reciever).then(({ socketId }) => {
//     console.log('Sending ', data.content, 'to', socketId)
//     const message = new Message(data._id, data.sender, data.reciever, data.content, data.status, data.type)
//     message.save().then(() => {
//       socket.to(socketId).emit('friendRequest', data)
//     }).catch(err => console.error(err))
//   }).catch(err => {
//     console.error(err)
//   })
// }

const onAcceptOrRejectFriendRequest = (data, socket) => {
  const user = new User()
  // when the recipient accepts the friend request
  // add the senders contact to recipient's contact list and vice versa then
  // send the the contact info of recipient to the sender
  const { requestId, actionType } = data.content
  if (actionType === 'reject') {
    // set request status 0 indicating it is rejected
    new Message().updateStatus(requestId, 0).catch((err) => console.error(err))
  }
  else {
    new Message().updateStatus(requestId, 2).catch((err) => console.error(err))
    user
      .getContacts(data.reciever)
      .then((result) => {
        // expected to refactor further
        if (result) {
          const recieverRealName = result.realName
          const recieverImage = result.image
          const recieverContacts = result.contacts
          user
            .getContacts(data.sender)
            .then((result) => {
              if (result) {
                if (!result.contacts.some(contact => contact.id === data.reciever) && !recieverContacts.some(contact => contact.id === data.sender)) {
                  const senderRealname = result.realName
                  const senderImage = result.image
                  const updContactsSender = [
                    ...result.contacts,
                    {
                      id: data.reciever,
                      chats: [],
                      name: recieverRealName,
                      image: recieverImage
                    }
                  ]
                  const updContactsReciver = [
                    ...recieverContacts,
                    {
                      id: data.sender,
                      chats: [],
                      name: senderRealname,
                      image: senderImage
                    }
                  ]
                  user
                    .addContacts(socket.userId, updContactsSender)
                    .then(() => {
                      user
                        .addContacts(data.reciever, updContactsReciver)
                        .catch((err) => {
                          console.error(err)
                        })
                      socket.emit('newContact', {
                        id: data.reciever,
                        chats: [],
                        name: recieverRealName,
                        image: recieverImage
                      })
                      user.getSocketId(data.reciever).then((result) => {
                        if (result) {
                          socket.to(result.socketId).emit('newContact', {
                            id: socket.userId,
                            chats: [],
                            name: senderRealname,
                            image: senderImage
                          })
                        }
                      })
                    })
                    .catch((err) => console.error(err))
                }
              }
            })
            .catch((err) => console.error(err))
        }
      })
      .catch((err) => console.error(err))
  }
}
// send messages in batch when requested by the client
const onGetChats = (data, socket) => {
  const sender = data.chatId
  const reciever = socket.userId
  const message = new Message()
  message
    .getMessages(sender, reciever)
    .toArray()
    .then(async (messages) => {
      const msgCount = await message.getMessageCount(sender, reciever)
      socket.emit('batchMessages', { messages, msgCount })
    })
    .catch((err) => console.log(err))
}

const onSearchContact = (data, socket) => {
  const { searchQuery } = data
  if (/^[a-z0-9_]+$/i.test(searchQuery)) {
    new User()
      .getUsers(searchQuery)
      .toArray()
      .then((users) => {
        socket.emit('searchResults', {
          searchResults: users
        })
      })
  }
}
const onProfileRequest = (data, socket) => {
  const { username } = data
  return new User()
    .getProfile(username)
    .then(({ realName }) => {
      socket.emit('profileInfo', {
        realName
      })
    })
    .catch((err) => console.error(err))
}

module.exports = {
  onDelivery,
  onChatMessage,
  onGetChats,
  // onFriendRequest,
  onAcceptOrRejectFriendRequest,
  onInitialLoadComplete,
  onInitialConnection,
  onSearchContact,
  Auth,
  onProfileRequest,
  onLoadChatPart
}
