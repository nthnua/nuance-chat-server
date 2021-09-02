const Lounge = (req, res, next) => {
  if (req.user) {
    const contacts = [{
      peerId: '7d15b674b2cd8d2d05d8e327',
      msgs: 2,
      name: 'John Doe'
    }, {
      peerId: 'c7fd33a5dc425a9a7b959bfe9020670551c1ad5113cee0a8ac23a513f93e3cd897e86547',
      msgs: 4,
      name: `John's father`
    }]
    res.json({
      contacts
    })
  }
}

const peerConnection = (req, res, next) => {
  if (req.user) {
    console.log(req.body)
  }
}

exports.peerConnection = peerConnection
exports.lounge = Lounge
