const _ = require('lodash')
const _globCache = require('./_globCache')
const _validateCacheArgs = require('./_validateCacheArgs')

module.exports = (pattern, useCache) => {
  _validateCacheArgs({pattern, useCache})

  if (useCache === false || !_.get(_globCache, pattern)) {
    return null
  }

  return _globCache[pattern]
}