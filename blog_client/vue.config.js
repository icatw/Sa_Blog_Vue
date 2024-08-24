module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      },
      "/chatApi": {
        target: "http://localhost:8999",
        changeOrigin: true,
        pathRewrite: {
          "^/chatApi": ""
        }
      },
      "/musicApi": {
        target: "http://localhost:3000",
        changeOrigin: true,
        pathRewrite: {
          "^/musicApi": ""
        }
      }
    },
    disableHostCheck: true
  },
  productionSourceMap: false,
  css: {
    extract: true,
    sourceMap: false
  }
};
