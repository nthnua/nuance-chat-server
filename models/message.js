const getDB = require('../util/db').getDB
const { ObjectId } = require('mongodb')

class Message {
    constructor(sender, reciever, time, id, content) {
        this.sender = sender
        this.reciever = reciever
        this.time = time
        this.id = id
        this.content = content
    }
    save() {
        const db = getDB()
        db.collections('messages').insertOne(this)
    }
}