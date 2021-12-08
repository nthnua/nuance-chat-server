const { MongoClient } = require('mongodb')

let _db = null

const mongoConnect = callback => {
  MongoClient.connect(process.env.MONGO_URL).then(client => {
    console.log('DB connected')
    _db = client.db()
    callback(client)
  }).catch(err => console.error(err))
}

const getDB = () => {
  if (_db) {
    return _db
  }
  throw new Error('DB not found!')
}

exports.mongoConnect = mongoConnect
exports.getDB = getDB
