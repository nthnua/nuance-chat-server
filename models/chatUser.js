const { getDB } = require("../util/db")

class ChatUser {
    constructor(onlineStatus = false, contacts = []) {
        this.online = onlineStatus
        this.contacts = contacts
    }
    save() {
        const db = getDB()
        db.collection('chatUsers').insertOne(this)
    }

}
module.exports = ChatUser