const getDB = require('../util/db').getDB
class Message {
  constructor (sender, reciever, content) {
    this.sender = sender
    this.reciever = reciever
    this.time = Date.now()
    this.content = content
  }

  save () {
    const db = getDB()
    return db.collection('messages').insertOne(this)
  }
}

module.exports = Message
