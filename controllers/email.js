// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
const User = require('../models/user')

const sendSignupMail = (recieverMail, recieverId, verifId) => {
  console.log(`Sending email verification link to ${recieverMail}`)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const host = process.env.HOST_ADDRESS
  const verificationLink = `${host}/api/verifymail?userId=${recieverId}&verifId=${verifId}`
  const msg = {
    to: recieverMail,
    from: 'nuance.chat@outlook.com',
    subject: 'Welcome to nuance',
    html: `
    <div>
    <h1>
    Thank you for signing up!
    </h1>
    <br/>
    <h4>
    Please verify your email by clicking the link below.
    <br/>
    <a href=${verificationLink}>click here</a>
    </h4>
    If the link is not working, copy and paste the url to your address bar:<br/>
    ${verificationLink}
    </div>
    `
  }
  return sgMail.send(msg)
}

const sendPasswordResetLink = (userId, token) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const frontend = process.env.FRONTEND_ADDRESS
  const verificationLink = `${frontend}/setnewpassword?token=${token}`
  return new User().getEmail(userId).then((result) => {
    if (result && result.email) {
      console.log(`Sending password reset link to ${result.email}`)
      const msg = {
        to: result.email,
        from: 'nuance.chat@outlook.com',
        subject: 'Password reset requested',
        html: `
      <div>
      <h4>
      To continue with your password reset request
      <br/>
      <a href=${verificationLink}>click here</a>
      </h4>
      If the link is not working, copy and paste the url to your address bar:<br/>
      ${verificationLink}
      </div>
      `
      }
      return sgMail.send(msg)
    }
  }).catch(err => console.error(err))
}
const sendPasswordResetSuccessMail = (userId) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  return new User().getEmail(userId).then((result) => {
    if (result && result.email) {
      console.log(`Sending password reset success notification to ${result.email}`)
      const msg = {
        to: result.email,
        from: 'nuance.chat@outlook.com',
        subject: 'Password reset successful',
        html: `
      <div>
      <h4>
      Your password for nuance.chat has been updated successfully.
      <br/>
      </h4>
      If you didn't initiate the request please contact us at <a href='mailto:nuance.chat@outlook.com'>nuance.chat@outlook.com</a>
      </div>
      `
      }
      return sgMail.send(msg)
    }
  }).catch(err => console.error(err))
}
module.exports = {
  sendSignupMail,
  sendPasswordResetLink,
  sendPasswordResetSuccessMail
}
exports.sendSignupMail = sendSignupMail
