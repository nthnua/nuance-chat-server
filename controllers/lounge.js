const Lounge = (req, res, next) => {
    console.log(req.headers.authorization)
}

exports.lounge = Lounge