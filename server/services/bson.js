const BSON = require('bson-ext')

const bson = new BSON([
	BSON.Binary,
	BSON.Code,
	BSON.DBRef,
	BSON.Decimal128,
	BSON.Double,
	BSON.Int32,
	BSON.Long,
	BSON.Map,
	BSON.MaxKey,
	BSON.MinKey,
	BSON.ObjectId,
	BSON.BSONRegExp,
	BSON.Symbol,
	BSON.Timestamp
])

function encode(obj) {
	return bson.serialize(obj)
}

function parse(data) {
	try {
		return bson.deserialize(data)
	} catch {
		return undefined
	}
}

module.exports = {
	encode,
	parse
}
