const getDB = require('../util/db').getDB

class User {
  constructor(username, password) {
    this.username = username
    this.password = password
    this.sessions = []
    this.creationtime = Date.now()
  }

  save() {
    const db = getDB()
    return db.collection('users').insertOne(this)
  }

  findMatch() {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        _id: 1
      }
    })
  }

  getUserCredentials() {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        password: 1,
        sessions: 1
      }
    })
  }

  addSession(sessionId, prevSessions) {
    const updatedSessions = [...prevSessions, sessionId]
    console.log(updatedSessions)
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: this.username }
    }, {
      $set: { sessions: updatedSessions }
    }
    )
  }

  getSessions(objId) {
    const db = getDB()
    return db.collection('users').findOne({
      _id: { $eq: objId }
    }, {
      projection: {
        _id: 0,
        sessions: 1
      }
    })
  }
}

module.exports = User
