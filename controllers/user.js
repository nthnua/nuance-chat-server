const bcrypt = require('bcrypt')
const userdb = require('../data/users.json')
const jwt = require('jsonwebtoken')
const fs = require('fs')


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
        userdb.username = username
        userdb.password = hash
        fs.writeFile('data/users.json', JSON.stringify(userdb), err => err ? console.error(err) : null)
    }).catch(err => console.error(err))
    res.status(201)
}

exports.signup = Signup
exports.login = Login