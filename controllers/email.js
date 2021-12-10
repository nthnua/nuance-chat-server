const sgMail = require('@sendgrid/mail')

const sendSignupMail = (recieverMail, recieverId, verifId) => {
  // using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const host = process.env.HOST_ADDRESS
  const verificationLink = `${host}/api/verifymail?userId=${recieverId}&verifId=${verifId}`
  const msg = {
    to: recieverMail, // Change to your recipient
    from: 'nuance.chat@outlook.com', // Change to your verified sender
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
    </div>
    `
  }
  return sgMail.send(msg)
}

exports.sendSignupMail = sendSignupMail
