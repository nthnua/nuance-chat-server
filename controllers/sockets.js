const jwt = require('jsonwebtoken')
const { createHash } = require('crypto')
const User = require('../models/user')
const { ObjectId } = require('mongodb')

const Auth = (socket, next) => {
  console.log('Todo: do not use auth token for socket auth, use a key instead')
  const token = socket.handshake.auth.token
  const secret = process.env.AUTH_TOKEN_SECRET
  jwt.verify(token, secret, (err, decoded) => {
    if (decoded) {
      const objId = new ObjectId(decoded.userId)
      const user = new User()
      // create a hash of jwt given to the client to compare
      // against an array of hashes in user database
      const hash = createHash('sha1').update(token).digest('base64')
      user.getSessions(objId).then(
        result => {
          if (result && result.sessions.includes(hash)) {
            console.log('req authed')
            socket.userId = decoded.userId
            return next()
          } else {
            return next(new Error('Unauthorized'))
          }
        }
      ).catch(err => console.error(err))
    } else {
      console.error(err)
      return next(new Error('Unauthorized'))
    }
  })
}

exports.socketsAuth = Auth
