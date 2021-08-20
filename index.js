const express = require('express')
const cors = require('cors')

const login = require('./controllers/auth').login

const app = express()

//enable cross origin resource sharing
app.use(cors())
//parse json body
app.use(express.json())

//handle post for login route
app.post('/api/login', login,)

app.listen(8000)