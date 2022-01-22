/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects () {
    return [
      // redirect the index page to our notion test suite
      {
        source: '/2478179dcfc2497fbf71f8622a983388',
        destination: '/',
        // don't set permanent to true because it will get cached by the browser
        // while developing on localhost
        permanent: false
      }
    ]
  }
}
