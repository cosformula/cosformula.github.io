/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects () {
    return [
      // redirect the index page to our notion test suite
      {
        source: '/2478179dcfc2497fbf71f8622a983388',
        destination: '/',
        permanent: false
      },
      {
        source: '/2020/02/29/canvas-text-wrap.html',
        destination: '/5dd7a169822b48fd9b4a186ff81b85bb',
        permanent: false
      }
    ]
  }
}
