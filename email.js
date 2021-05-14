const path = require('path')
const Mailgun = require('mailgun-js')
const mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN, host: process.env.MAILGUN_HOST})
const attachment = path.join(__dirname, 'answered.png')

async function sendEmail (to, success) {
  const mailOptions = {
    from: process.env.FROM,
    to,
    subject: success ? 'Keeping your THM streak going!' : 'Failed to keep your THM streak going',
    text: 'Find a screenshot attached',
    attachment
  }

  await mailgun.messages().send(mailOptions, (err, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Email sent:', body)
    }
  })
}

module.exports = sendEmail