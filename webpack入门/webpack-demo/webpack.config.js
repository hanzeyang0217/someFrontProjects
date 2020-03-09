const path = require("path");
const base = require(`./webpack.config.base.js`);

module.exports = {
  ...base,
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      ...base.module.rules,

      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
