const ChatUser = require('../models/chatUser')

const Lounge = (req, res, next) => {
  if (req.user) {
    // const contacts = Array(25).fill({
    //   id: 1,
    //   peerId: '594771cc81b7d63bf88fbf8ab5b55909ac0fc076478b83c090c10fa39991513d24e65e50',
    //   chatId: 1,
    //   name: 'John Doe'
    // })
    // const contacts = Array(20).fill({
    //   //from: 613626668852483c04e43285
    //   id: '6136267d8852483c04e43286',
    //   chatId: 1,
    //   name: 'John Doe'
    // })
    const contacts = [
      {
        id: 'someone',
        chats: [
        ],
        name: 'John Doe'
      },
      {
        id: 'someone_else',
        chats: [
        ],
        name: 'Johnnny'
      }]
    const loungeUser = new ChatUser(req.user, true, contacts)
    loungeUser.save()
    loungeUser.getContacts().then(contacts => {
      console.log(contacts)
      res.json(contacts)
    }).catch(err => console.error(err))

    // res.json({
    //   contacts
    // })
  }
}

const getChats = (req, res, next) => {
  if (req.user) {
    // console.log(req.params)
    res.json({
      chats: [{
        sender: '6130909c88b0d52426895de1',
        reciever: '613626668852483c04e43285',
        content: 'Hiii',
        time: '1'
      }, {
        sender: '2',
        reciever: 'You',
        content: 'Hello',
        time: '2'
      }
      ]
    })
  }
}

// const setSocketId = (req, res, next) => {
//   if (req.user) {
//     const user = new User()
//     user.setSocketId(req.body.socketId, req.user).then(result => {
//       console.log(result)
//       res.status(200).json({
//         socketId: req.body.socketId,
//         message: 'SocketId set successfully'
//       })
//     }).catch(err => console.error(err))
//   }
// }

// exports.setSocketId = setSocketId
exports.getChats = getChats
exports.lounge = Lounge
