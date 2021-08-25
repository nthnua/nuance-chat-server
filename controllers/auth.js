const jwt = require('jsonwebtoken')
const userdb = require('../data/users.json')

const Auth = (req, res, next) => {
    const token = req.headers.authorization
    const secret = process.env.AUTH_TOKEN_SECRET
    jwt.verify(token, secret, (data, err) => {
        req.userdata = data
    })
    next()
}
exports.auth = Auth