const _globCache = require('./_globCache')
const _validateCacheArgs = require('./_validateCacheArgs')

module.exports = (pattern, output, useCache) => {
  _validateCacheArgs({pattern, output, useCache})

  if (useCache === false) {
    return false
  }

  _globCache[pattern] = output
}