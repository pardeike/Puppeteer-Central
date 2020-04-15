const path = require('path')
const NodemonPlugin = require('nodemon-webpack-plugin')

const nodemonPlugin = new NodemonPlugin({
	watch: [path.resolve('./server')],
	verbose: true,
	nodeArgs: [],
	script: './server/main.js',
	ext: 'js'
})

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './www',
		port: 3000
	},
	output: {
		path: path.resolve(__dirname, 'www'),
		filename: '[name].js'
	},
	plugins: [nodemonPlugin],
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		alias: {}
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/react',
							{
								plugins: ['@babel/plugin-proposal-class-properties']
							}
						]
					}
				}
			}
		]
	}
}
