const bcrypt = require('bcrypt')
const userdb = require('../data/users.json')
const jwt = require('jsonwebtoken')

const sendAuthToken = (req, res) => {

}

const Login = (req, res, next) => {
    const password = req.body.passphrase
    const hash = userdb.passphrase
    //const saltRounds = 10
    //bcrypt.hash(passphrase, saltRounds).then(hash => console.log(hash)).catch(err => console.error(err));
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

}

exports.login = Login