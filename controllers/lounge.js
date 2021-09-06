const Lounge = (req, res, next) => {
  if (req.user) {
    // const contacts = Array(25).fill({
    //   id: 1,
    //   peerId: '594771cc81b7d63bf88fbf8ab5b55909ac0fc076478b83c090c10fa39991513d24e65e50',
    //   chatId: 1,
    //   name: 'John Doe'
    // })
    const contacts = [{
      id: '613093cfa0d8deb19738bbd0',
      peerId: '5c5b3efe322d409ba694dd1fd7641f63baf6e5b6b31066b0a53d42b2588e6efa2f7cba48',
      chatId: 1,
      name: 'John Doe'
    }, {
      id: '6130909c88b0d52426895de1',
      peerId: 'ae1918e0e2154d05b0315678a0a0ab303a296cc6d328e1fef77dcfcb6159eee7c17bd0d5',
      chatId: 2,
      name: `John's father`
    }]
    res.json({
      contacts
    })
  }
}

const getChats = (req, res, next) => {
  if (req.user) {
    console.log(req.params)
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
