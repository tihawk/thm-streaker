const puppeteer = require('puppeteer')
const thmUrl = 'https://tryhackme.com'

const cookies = [
  {
    name: '__cfduid',
    value: process.env.__cfduid,
    url: thmUrl
  },
  {
    name: '_csrf',
    value: process.env._csrf,
    url: thmUrl
  },
  {
    name: 'AWSALB',
    value: process.env.AWSALB,
    url: thmUrl
  },
  {
    name: 'cf_clearance',
    value: process.env.cf_clearance,
    url: thmUrl
  },
  {
    name: 'connect.sid',
    value: process.env['connect.sid'],
    url: thmUrl
  },
  {
    name: 'cookieconsent_status',
    value: process.env.cookieconsent_status,
    url: thmUrl
  },
]

async function retry (promiseFactory, retryCount) {
  try {
    return await promiseFactory()
  } catch (e) {
    if (retryCount <= 0) {
      throw e
    }
    return await retry(promiseFactory, retryCount - 1)
  }
}

function pageLogger (msg) {
  if (msg._location && msg._location.url !== '__puppeteer_evaluation_script__') return
  for (let i = 0; i < msg.args().length; ++i) {
    if (msg.args()[i]._remoteObject) {
      console.log(`${new Date()} [PageConsole]`, msg.args()[i]._remoteObject.value)
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function openRoomAndAnswer(browser, roomName) {
  let success = false
  try {
    const page = await browser.newPage()
    // console listener for the page
    page.on('console', pageLogger)

    const pageUrl = `${thmUrl}/room/${roomName}`

    await page.setCookie(...cookies)
    await retry(() => page.goto(pageUrl, {waitUntil: 'networkidle0', timeout: 30000}), 10)
    console.log('[openRoomAndAnswer] hath openeth the room page, commencing resetting progress lawl')
    
    await page.evaluate(() => {
      document.querySelector('a[data-target="#resetUserProgressModal"]').click()
    })
    await sleep(1000)
    await page.evaluate(() => {
      document.querySelector('#resetUserProgressModal button.btn-danger').click()
    })

    console.log('[openRoomAndAnswer] hath reseteth, waiting for page refresh')
    await page.waitForNavigation()
    await page.waitForSelector('#task-1')
    console.log('[openRoomAndAnswer] hath refresheth the room page, commencing answering lawl')

    await page.evaluate(() => {
      document.querySelector('#task-1 button.task-answer').click()
    })
    await page.waitForSelector('#task-1 button.task-answer')
    await sleep(2000)

    console.log('[openRoomAndAnswer] hath answereth! let me take a screenshot')
    await page.screenshot({path: 'answered.png'})

    success = true
    await page.close()
  } catch (e) {
    await browser.close()
    throw e
  } finally {
    return success
  }
}

async function getBrowser() {
    return await puppeteer.launch({
        args: ['--no-sandbox'],
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        devtools: false // true for nonheadless Browser with devtools opened
    });
}

async function run(roomName='openvpn') {
    const browser = await getBrowser();
    let success = false
    try {
        success = await openRoomAndAnswer(browser, roomName)
    } catch (e) {
        await browser.close()
        throw e
    } finally {
      await browser.close()
      return success
    }
}

module.exports = run