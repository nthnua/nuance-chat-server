const Lounge = (req, res, next) => {
  if (req.user) {
    const contacts = Array(25).fill({
      id: 1,
      peerId: '7d15b674b2cd8d2d05d8e327',
      chatId: 1,
      name: 'John Doe'
    })
    // const contacts = [{
    //   id: 1,
    //   peerId: '7d15b674b2cd8d2d05d8e327',
    //   chatId: 1,
    //   name: 'John Doe'
    // }, {
    //   id: 2,
    //   peerId: 'c7fd33a5dc425a9a7b959bfe9020670551c1ad5113cee0a8ac23a513f93e3cd897e86547',
    //   chatId: 2,
    //   name: `John's father`
    // }]
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
        reciever: 'Him',
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
