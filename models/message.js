const getDB = require('../util/db').getDB
class Message {
  constructor (_id, sender, reciever, content, status) {
    this._id = _id
    this.sender = sender
    this.reciever = reciever
    this.time = Date.now()
    this.content = content
    this.status = status
  }

  save () {
    const db = getDB()
    return db.collection('messages').insertOne(this)
  }

  updateStatus (_id, status) {
    const db = getDB()
    return db.collection('messages').updateOne({
      _id: { $eq: _id }
    }, {
      $set: { status: status }
    }
    )
  }

  getUndeliveredMessages (recieverId) {
    const db = getDB()
    return db.collection('messages').find({
      reciever: { $eq: recieverId },
      status: { $eq: 1 }
    })
  }

  getDeliveredButNotAckdMsgs (senderId) {
    const db = getDB()
    return db.collection('messages').find({
      sender: { $eq: senderId },
      status: { $eq: 2 }
    })
  }

  getMessages (sender, reciever) {
    const db = getDB()
    return db.collection('messages').find(
      {
        $or: [{
          sender: { $eq: sender },
          reciever: { $eq: reciever }

        },
        {
          sender: { $eq: reciever },
          reciever: { $eq: sender }

        }
        ]
      }
    ).limit(15).sort({ time: -1 })
  }
}

module.exports = Message
