const Lounge = (req, res, next) => {
  if (req.user) {
    // const contacts = Array(25).fill({
    //   id: 1,
    //   peerId: '594771cc81b7d63bf88fbf8ab5b55909ac0fc076478b83c090c10fa39991513d24e65e50',
    //   chatId: 1,
    //   name: 'John Doe'
    // })
    const contacts = [{
      id: '613626668852483c04e43285',
      peerId: '67fd947394d03e57be02a8b5f5c414fe80658953b5562042d265d5b2c293941d07ad9865',
      chatId: 1,
      name: 'John Doe'
    }, {
      id: '6136267d8852483c04e43286',
      peerId: '6b840f92bafcd87291cf52c4d3d96b02b85a536aa3cf9dcdb7b233ed9a31ec93b17346f9',
      chatId: 2,
      name: 'Johnnny'
    }]
    res.json({
      contacts
    })
  }
}

const getChats = (req, res, next) => {
  if (req.user) {
    // console.log(req.params)
    res.json({
      chats: [{
        sender: '6130909c88b0d52426895de1',
        reciever: '613093cfa0d8deb19738bbd0',
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

exports.getChats = getChats
exports.lounge = Lounge
