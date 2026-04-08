import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 8000))

const info = await page.evaluate(() => {
  const root = document.documentElement
  const style = window.getComputedStyle(root)
  return {
    themeBg: style.getPropertyValue('--theme-bg'),
    base: style.getPropertyValue('--base'),
    themeElevation0: style.getPropertyValue('--theme-elevation-0'),
    themeText: style.getPropertyValue('--theme-text'),
    styleTagCount: document.querySelectorAll('style').length,
    linkCount: document.querySelectorAll('link[rel="stylesheet"]').length,
    styleTagContents: Array.from(document.querySelectorAll('style')).map(s => s.textContent?.slice(0, 100)),
    bodyComputedBg: window.getComputedStyle(document.body).backgroundColor,
    htmlDataTheme: document.documentElement.getAttribute('data-theme'),
  }
})

console.log(JSON.stringify(info, null, 2))
await browser.close()
