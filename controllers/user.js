const bcrypt = require('bcrypt')
const userdb = require('../data/users.json')
const jwt = require('jsonwebtoken')

const Login = (req, res, next) => {
    const password = req.body.password
    const hash = userdb.passphrase

    //compare submitted password with stored one and return a jwt if valid
    bcrypt.compare(password, hash).then(result => {
        if (result) {
            const token = jwt.sign({
                data: {
                    userid: userdb.id
                }
            }, 'secret', { expiresIn: '1h' })
            res.json({
                token
            })
        }
        else {
            res.status(401).json({
                token: ''
            })
        }
    })


}

const Signup = (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    const saltRounds = 10
    bcrypt.hash(password, saltRounds).then((hash) => {
        console.log(hash)
    }).catch(err => console.error(err))

}

exports.login = Login