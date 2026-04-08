import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

// Capture all network requests
const cssRequests = []
const failedRequests = []
page.on('request', req => {
  if (req.resourceType() === 'stylesheet') cssRequests.push(req.url())
})
page.on('requestfailed', req => {
  failedRequests.push({ url: req.url(), type: req.resourceType(), failure: req.failure()?.errorText })
})

await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 5000))

// Check stylesheets in page
const info = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href)
  const styles = Array.from(document.styleSheets).map(s => ({
    href: s.href,
    rules: s.cssRules ? s.cssRules.length : 'inaccessible'
  }))
  const bodyClass = document.body.className
  const bodyBg = window.getComputedStyle(document.body).backgroundColor
  const html = document.documentElement.outerHTML.slice(0, 500)
  return { links, styles, bodyClass, bodyBg, html }
})

console.log('CSS Requests:', cssRequests)
console.log('Failed Requests:', failedRequests)
console.log('Page info:', JSON.stringify(info, null, 2))

await page.screenshot({ path: path.join(__dirname, 'screenshot/debug.png') })
await browser.close()
