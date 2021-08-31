const getDB = require('../util/db').getDB

class User {
  constructor (username, password) {
    this.username = username
    this.password = password
    this.creationtime = Date.now()
  }

  save () {
    const db = getDB()
    return db.collection('users').insertOne(this)
  }

  findMatch () {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        _id: 1
      }
    })
  }

  getUserCredentials () {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        password: 1
      }
    })
  }
}

module.exports = User
