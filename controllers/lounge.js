const Lounge = (req, res, next) => {
  if (req.userdata) {
    console.log(req.userdata)
    res.json({
      contacts: [{
        id: 1,
        msgs_id: 2,
        name: 'who'
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
