const { body, validationResult } = require('express-validator')
const userValidationRules = () => {
  return [
    body('username').custom((value) => /^[a-z0-9_]+$/i.test(value)).trim().isLength({ min: 5, max: 62 }),
    body('realName').notEmpty().isLength({ max: 62 }), body('age').isNumeric().toInt(), body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 5, max: 62 })
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) { return next() }
  return res.status(400).json({ errors: errors.array() })
}

module.exports = {
  userValidationRules,
  validate
}
