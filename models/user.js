const { getDB } = require('../util/db')

class User {
  constructor (username, password, realName, age, email, image, verificationCode, verified = false, onlineStatus = false, contacts = [], randomState = 0) {
    this.username = username
    this.password = password
    this.sessions = []
    this.creationtime = Date.now()
    this.realName = realName
    this.age = age
    this.email = email
    this.verificationCode = verificationCode
    this.verified = verified
    this.onlineStatus = onlineStatus
    this.contacts = contacts
    this.randomState = randomState
    this.image = image
  }

  save () {
    const db = getDB()
    return db.collection('users').insertOne(this, {
      writeConcern: { w: 'majority', wtimeout: 5000 }
    })
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

  doesExist (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
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

  addSession (username, sessionId, prevSessions) {
    const updatedSessions = [...prevSessions, sessionId]
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: username }
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
      if (userCreds) {
        const updatedSessions = userCreds.sessions.filter(session => session !== sessionId)
        return db.collection('users').updateOne({
          username: { $eq: userId }
        }, {
          $set: { sessions: updatedSessions }
        }
        )
      }
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

  getEmail (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        email: 1
      }
    })
  }

  getProfile (userId) {
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
        username: { $regex: `^${userId}`, $options: 'i' }
      },
      {
        projection: {
          _id: 0,
          username: 1,
          realName: 1
        }
      }
    ).limit(15).sort({ realName: 1 })
  }

  setNewPassword (userId, hash) {
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: userId }
    }, {
      $set: { password: hash }
    }
    )
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
  getContacts (id) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: id }
    }, {
      projection: {
        _id: 0,
        contacts: 1,
        realName: 1,
        image: 1
      }
    })
  }

  getOnlineStatus (id) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: id }
    }, {
      projection: {
        _id: 0,
        onlineStatus: 1
      }
    })
  }

  addContacts (userId, contacts) {
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: userId }
    }, {
      $set: { contacts }
    }
    )
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
    return db.collection('users').updateOne({
      username: { $eq: userId }
    },
    {
      $set: { randomState }
    })
  }
}

module.exports = User
