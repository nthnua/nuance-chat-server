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
}

module.exports = Message
