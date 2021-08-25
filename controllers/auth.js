const jwt = require('jsonwebtoken')
const userdb = require('../data/users.json')

const Auth = (req, res, next) => {
    const token = req.headers.authorization
    const secret = process.env.AUTH_TOKEN_SECRET
    const t = jwt.verify(token, secret)
    console.log(t)
    next()
}

exports.auth = Auth