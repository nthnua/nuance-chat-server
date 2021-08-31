const jwt = require('jsonwebtoken')

const Auth = (req, res, next) => {
  const token = req.headers.authorization
  const secret = process.env.AUTH_TOKEN_SECRET
  jwt.verify(token, secret, (err, decoded) => {
    if (decoded) {
      console.log(decoded)
      next()
    } else {
      console.error(err)
      res.status(401).send('Token expired')
    }
  })
}
exports.auth = Auth
