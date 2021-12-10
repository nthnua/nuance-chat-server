const { getDB } = require('../util/db')

class ChatUser {
  constructor (id, onlineStatus = false, contacts = [], randomState = 0) {
    this._id = id
    this.onlineStatus = onlineStatus
    this.contacts = contacts
    this.randomState = randomState
  }

  save () {
    const db = getDB()
    db.collection('chatUsers').insertOne(this)
  }

  getContacts () {
    const db = getDB()
    return db.collection('chatUsers').findOne({
      _id: { $eq: this._id }
    }, {
      projection: {
        _id: 0,
        contacts: 1
      }
    })
  }

  getOnlineStatus () {
    const db = getDB()
    return db.collection('chatUsers').findOne({
      _id: { $eq: this._id }
    }, {
      projection: {
        _id: 0,
        onlineStatus: 1
      }
    })
  }

  addContacts (userId, contact) {
    const db = getDB()
    return db.collection.findOne({
      _id: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        contacts: 1
      }
    }).then(data => {
      const updContacts = [...data.contacts, contact]
      return db.collection('chatUsers').updateOne({
        _id: { $eq: userId }
      }, {
        $set: { contacts: updContacts }
      }
      )
    })
  }

  getRandomUser () {
    const db = getDB()
    return db.mycoll.aggregate([
      { $match: { randomState: 1 } },
      { $sample: { size: 1 } }
    ])
  }

  setRandomState (userId, randomState = 0) {
    const db = getDB()
    return db.collection('chatUsers').updateOne({
      _id: { $eq: userId }
    },
    {
      $set: { randomState }
    })
  }
}
module.exports = ChatUser
