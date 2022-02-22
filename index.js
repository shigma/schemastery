const { default: Schema, ...utils } = require('./lib/node')

module.exports = Schema
module.exports.default = Schema
Object.assign(module.exports, utils)
