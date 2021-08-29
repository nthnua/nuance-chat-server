const bcrypt = require('bcrypt')
const userdb = require('../data/users.json')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const User = require('../models/user')


const Login = (req, res, next) => {
    const password = req.body.password
    const hash = userdb.password
    const jwt_secret = process.env.AUTH_TOKEN_SECRET

    //compare submitted password with stored one and return a jwt if valid
    bcrypt.compare(password, hash).then(result => {
        if (result) {
            const token = jwt.sign({
                data: {
                    userid: userdb.id
                }
            }, jwt_secret, { expiresIn: '1h' })
            res.json({
                token
            })
        }
        else {
            res.status(401).json({
                token: ''
            })
        }
    }).catch(err => console.error(err))


}

const Signup = (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    const saltRounds = 10
    bcrypt.hash(password, saltRounds).then((hash) => {
        const user = new User(username, hash)
        user.findMatch().then(result => {
            if (result) {
                console.log(result)
                res.status(409).send('username already exists:(')
            }
            else {
                user.save().then(result => {
                    console.log(result)
                    res.status(201).send('Success:)')
                }).catch(err => console.err(err))
            }
        }).catch(err => console.log(err))
    }).catch(err => console.error(err))
}

exports.signup = Signup
exports.login = Login