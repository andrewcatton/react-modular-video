const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const env = process.env.WEBPACK_BUILD || "development";
const libraryName = "react-modular-video";

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function(compiler) {
  compiler.plugin("done", function() {
    const dts = require("dts-bundle");
    dts.bundle({
      name: libraryName,
      main: "_dist/src/index.d.ts",
      out: "../../dist/index.d.ts"
    });
  });
};

const config = {
  mode: env,
  entry: `${__dirname}/src/index`,
  devtool: "source-map",
  output: {
    filename: "index.js",
    library: libraryName,
    libraryTarget: "umd",
    path: `${__dirname}/dist`
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".mjs", ".ts", ".tsx", ".js", ".json"],
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
        test: /\.(mp4)$/,
        exclude: /node_modules/,
        loader: "file-loader?name=videos/[name].[ext]"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled"
    })
  ]
};
if (env === "development") {
  config.devServer = {
    disableHostCheck: true,
    contentBase: __dirname + "/dist",
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
  config.plugins.push(new DtsBundlePlugin());
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
    },
    {
      "styled-components": {
        commonjs: "styled-components",
        commonjs2: "styled-components",
        amd: "styled-components"
      }
    }
  ];
}

module.exports = config;
