const { body, validationResult } = require('express-validator')
const userValidationRules = () => {
  return [
    body('username').isAlphanumeric().trim(),
    body('realName').notEmpty(), body('age').isNumeric().toInt(), body('email').isEmail().normalizeEmail(),
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
