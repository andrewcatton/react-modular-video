const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const env = process.env.WEBPACK_BUILD || "development";

const config = {
  mode: env,
  entry: `${__dirname}/src/index.tsx`,

  output: {
    filename: "react-modular-video.js",
    library: "ReactModularVideo",
    libraryTarget: "umd",
    path: `${__dirname}/lib`
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "react-modular-video": path.resolve(__dirname, "src"),
      src: path.resolve(__dirname, "src")
    }
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|ico)$/,
        exclude: /node_modules/,
        loader: "file-loader?name=images/[name].[ext]"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(mp4)$/,
        exclude: /node_modules/,
        loader: "file-loader?name=videos/[name].[ext]"
      }
    ]
  },
  plugins: [new CleanWebpackPlugin(["lib"])]
};
console.log("env :", env);
if (env === "development") {
  config.devServer = {
    disableHostCheck: true,
    contentBase: __dirname + "/lib",
    historyApiFallback: true,
    stats: {
      chunks: false
    }
  };
  config.plugins.push(
    new HtmlWebpackPlugin({
      title: "React Modular Video Example",
      template: __dirname + "/example/index.html"
    })
  );
  config.entry = __dirname + "/example/app";
  config.module.rules.push({
    test: /\.html$/,
    exclude: /index\.html/,
    use: ["html-loader"]
  });
}
if (env === "production") {
  config.externals = [
    {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react"
      }
    },
    {
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom"
      }
    }
  ];
}

module.exports = config;
