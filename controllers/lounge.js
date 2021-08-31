const Lounge = (req, res, next) => {
  console.log(req.user)
  if (req.user) {
    console.log(req.user)
    res.json({
      contacts: [{
        id: 1,
        msgs_id: 2,
        name: 'woo'
      },
      {
        id: 2,
        msgs_id: 3,
        name: 'whe'
      }]
    })
  }
}

exports.lounge = Lounge
