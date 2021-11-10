const { getDB } = require("../util/db")

class ChatUser {
    constructor(id, onlineStatus = false, contacts = []) {
        this._id = id
        this.onlineStatus = onlineStatus
        this.contacts = contacts
    }
    save() {
        const db = getDB()
        db.collection('chatUsers').insertOne(this)
    }
    getContacts() {
        const db = getDB()
        return db.collection('chatUsers').findOne({
            _id: { $eq: this._id }
        }, {
            projection: {
                _id: 0,
                contacts: 1
            }
        })
    }
    getOnlineStatus() {
        const db = getDB()
        return db.collection('chatUsers').findOne({
            _id: { $eq: this._id }
        }, {
            projection: {
                _id: 0,
                onlineStatus: 1
            }
        })
    }

}
module.exports = ChatUser