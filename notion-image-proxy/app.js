const Koa = require('koa')
const KoaRouter = require('koa-router')
const sendFile = require('koa-sendfile')
const path = require('path')
const axios = require('axios')
const app = new Koa()
const router = new KoaRouter()

const decodeBase64Url = str => {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

router.get(`/`, async ctx => {
  await sendFile(ctx, path.join(__dirname, 'index.html'))
})

// Routes
router.get(`*`, async ctx => {
  console.log(ctx.URL)
  const pathname = ctx.URL.pathname
  const url = new URL(decodeBase64Url(decodeURI(pathname.replace(/\//g, ''))))

  const realUrl = url.href
  console.log('url', url)
  const imageUrl = 'https://www.notion.so/image/' + encodeURIComponent(realUrl) + ctx.URL.search
  console.log(imageUrl)
  const imageRes = await axios.get(imageUrl, { responseType: 'stream' })
  ctx.type = imageRes.headers['content-type']
  ctx.body = imageRes.data
})

app.use(router.allowedMethods()).use(router.routes())

// Web 类型云函数，只能监听 9000 端口
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`)
})
