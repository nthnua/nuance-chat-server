const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { createHash, randomBytes } = require('crypto')
const { sendSignupMail } = require('./email')

const Login = (req, res, next) => {
  const tokenSecret = process.env.AUTH_TOKEN_SECRET
  const user = new User(req.body.username, req.body.password)
  user.getUserCredentials().then(userCreds => {
    if (userCreds) {
      bcrypt.compare(user.password, userCreds.password).then(match => {
        if (match) {
          const token = jwt.sign({
            userId: req.body.username
          }, tokenSecret, { expiresIn: '100d' })
          const sessionId = createHash('sha1').update(token).digest('base64')
          user.addSession(sessionId, userCreds.sessions).then().catch(err => console.error(err))
          res.json({
            id: req.body.username,
            token
          })
        } else {
          res.status(401).json({
            message: 'Invalid username or password!'
          })
        }
      }).catch(err => console.log(err))
    } else {
      res.status(401).json({
        message: 'Invalid username or password!'
      })
    }
  }).catch(err => console.log(err))
  // const password = req.body.password
  // const hash = userdb.password
  // const tokenSecret = process.env.AUTH_TOKEN_SECRET

  // // compare submitted password with stored one and return a jwt if valid
  // bcrypt.compare(password, hash).then(result => {
  //   if (result) {
  //     const token = jwt.sign({
  //       data: {
  //         userid: userdb.id
  //       }
  //     }, tokenSecret, { expiresIn: '1h' })
  //     res.json({
  //       token
  //     })
  //   } else {
  //     res.status(401).json({
  //       token: ''
  //     })
  //   }
  // }).catch(err => console.error(err))
}

const Signup = (req, res, next) => {
  const username = req.body.username
  const password = req.body.password
  const verifId = randomBytes(100).toString('base64')

  const saltRounds = 10
  bcrypt.hash(password, saltRounds).then((hash) => {
    const user = new User(username, hash, req.body.realName, req.body.age, req.body.email, verifId, false)
    user.findMatch().then(matches => {
      if (matches) {
        console.log(matches)
        res.status(409).json({
          message: 'username or email already exists.'
        })
      } else {
        user.save().then(result => {
          sendSignupMail(req.body.email, username, verifId)
          res.status(201).json({
            message: 'Signup successful'
          })
        }).catch(err => console.err(err))
      }
    }).catch(err => console.log(err))
  }).catch(err => console.error(err))
}

const Logout = (req, res, next) => {
  const user = new User()
  user.removeSession(req.session, req.user).then(() => {
    res.status(200).json({
      message: 'Logout successful'
    })
  }).catch(err => {
    console.error(err)
    res.status(400).json({
      message: 'Bad request'
    })
  }
  )
}
const VerifyMail = (req, res, next) => {
  const verifUserId = req.query.userId || ''
  const verifCode = req.verifId || ''

  const user = new User()
  user.getVerificationCode(verifUserId).then(({ verificationCode }) => {
    if (verificationCode === verifCode) {
      user.setVerification(verifUserId, true)
      res.status(200).json({
        msg: 'Email verified... Thank you :)'
      })
    } else {
      res.status(400).json({
        msg: 'Invalid id or code!'
      })
    }
  })
}
exports.logout = Logout
exports.signup = Signup
exports.login = Login
exports.verifymail = VerifyMail
