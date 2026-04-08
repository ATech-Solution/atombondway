import puppeteer from 'puppeteer'
import path from 'path'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshot')

if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true })

function nextFilename(label) {
  const files = existsSync(screenshotDir) ? readdirSync(screenshotDir) : []
  const nums = files
    .map(f => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map(m => parseInt(m[1]))
  const n = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return label
    ? path.join(screenshotDir, `screenshot-${n}-${label}.png`)
    : path.join(screenshotDir, `screenshot-${n}.png`)
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

// --- Screenshot 1: Login page ---
await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0', timeout: 60000 })
// Wait for CSS to load - check that a styled element exists (the form should have payload's styles)
await page.waitForFunction(() => {
  // Check if any stylesheet has loaded
  return Array.from(document.styleSheets).length > 0 &&
    document.body.innerText.length > 10
}, { timeout: 15000 }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))
const loginFile = nextFilename('login')
await page.screenshot({ path: loginFile, fullPage: false })
console.log('Saved login screenshot:', loginFile)

// --- Screenshot 2: Dashboard (after login) ---
// Use correct admin credentials
try {
  await page.waitForSelector('input[name="email"]', { timeout: 10000 })
  await page.click('input[name="email"]', { clickCount: 3 })
  await page.type('input[name="email"]', 'tan@atech.software')
  await page.waitForSelector('input[name="password"]', { timeout: 5000 })
  await page.click('input[name="password"]', { clickCount: 3 })
  await page.type('input[name="password"]', 'Admin@123')

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
    page.click('button[type="submit"]')
  ])
  await new Promise(r => setTimeout(r, 5000))
  console.log('Logged in, current URL:', page.url())
} catch (e) {
  console.log('Login note:', e.message, '| URL:', page.url())
}
const dashFile = nextFilename('dashboard')
await page.screenshot({ path: dashFile, fullPage: false })
console.log('Saved dashboard screenshot:', dashFile)

await browser.close()
