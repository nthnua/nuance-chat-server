const Lounge = (req, res, next) => {
  if (req.user) {
    console.log(req.user)
    const contacts = Array(25).fill({
      id: 1,
      msgs: 2,
      name: 'John Doe'
    }
    )
    res.json({
      contacts
    })
  }
}

exports.lounge = Lounge
