module.exports = {
  apps: [
    {
      name: "tlc_frontend",
      script: "./app.js",
      exec_interpreter: "./node_modules/.bin/babel-node",
      env: {
        NODE_ENV: "production",
        BASE_PATH: process.env.BASE_PATH,
        POST_API_ENCRYPTION_KEY: process.env.POST_API_ENCRYPTION_KEY,
        ASSETS_CDN_PATH: process.env.ASSETS_CDN_PATH,
        PORT: process.env.PORT,
        PORT_SSL: process.env.PORT_SSL,
        API_URL: process.env.API_URL,
        CHANNEL: process.env.CHANNEL,
        JS_CSS_CDN_PATH: process.env.JS_CSS_CDN_PATH
      }
    }
  ]
};
