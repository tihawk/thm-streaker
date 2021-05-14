require('dotenv').config()
const run = require('./thmStreaker')
const sendEmail = require('./email')

const roomName = 'openvpn'

run(roomName).then(async success => {
    await sendEmail(process.env.ONLY_ME, success)
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(process.exit())
        }, 2000)
    })
})
