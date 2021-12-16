const { getDB } = require('../util/db')

class User {
  constructor (username, password, realName, age, email, verificationCode, verified = false) {
    this.username = username
    this.password = password
    this.sessions = []
    this.creationtime = Date.now()
    this.realName = realName
    this.age = age
    this.email = email
    this.verificationCode = verificationCode
    this.verified = verified
  }

  save () {
    const db = getDB()
    return db.collection('users').insertOne(this)
  }

  findMatch () {
    const db = getDB()
    return db.collection('users').findOne({
      $or: [{ username: { $eq: this.username } }, { email: { $eq: this.email } }]
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
        password: 1,
        sessions: 1
      }
    })
  }

  addSession (sessionId, prevSessions) {
    const updatedSessions = [...prevSessions, sessionId]
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: this.username }
    }, {
      $set: { sessions: updatedSessions }
    }
    )
  }

  removeSession (sessionId, userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        sessions: 1
      }
    }).then(userCreds => {
      const updatedSessions = userCreds.sessions.filter(session => session !== sessionId)
      return db.collection('users').updateOne({
        username: { $eq: userId }
      }, {
        $set: { sessions: updatedSessions }
      }
      )
    }).catch(err => console.error(err))
  }

  getSessions (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        sessions: 1
      }
    })
  }

  setSocketId (socketId, userId) {
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: userId }
    }, {
      $set: { socketId }
    }
    )
  }

  getSocketId (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        socketId: 1
      }
    })
  }

  getName (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        realName: 1
      }
    })
  }

  getVerificationCode (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        verificationCode: 1
      }
    })
  }

  setVerification (userId, verificStatus) {
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: userId }
    }, {
      $set: { verified: verificStatus }
    }
    )
  }

  getUsers (userId) {
    const db = getDB()
    return db.collection('users').find(
      {
        username: { $eq: userId }
      },
      {
        _id: 0,
        username: 1,
        realName: 1
      }
    ).limit(15).sort({ realName: 1 })
  }

  // saveFriendRequest (userId, req) {
  //   const db = getDB()
  //   return db.collection('users').findOne({
  //     username: { $eq: userId }
  //   }, {
  //     projection: {
  //       _id: 0,
  //       requests: 1
  //     }
  //   }).then(data => {
  //     const updatedReqs = [...data.requests, req]
  //     return db.collection('users').updateOne({
  //       username: { $eq: userId }
  //     }, {
  //       $set: { requests: updatedReqs }
  //     }
  //     ).catch(err => console.error(err))
  //   }).catch(err => {
  //     console.error(err)
  //   })
  // }
}

module.exports = User
