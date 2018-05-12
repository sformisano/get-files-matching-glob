const glob = require('glob')
const _ = require('lodash')
const _maybeGetCachedOutput = require('./_maybeGetCachedOutput')
const _maybeSetCachedOutput = require('./_maybeSetCachedOutput')

/**
 * Takes a glob pattern as argument, checks the cache to see if data has already been requested for this pattern.
 * If there's cached data, returns it. If not, returns the matching files. Throws an exception if no files match the
 * glob pattern or if the argument passed to the glob pattern parameter is not a string.
 *
 * @param {string} pattern
 * @param {Boolean} useCache
 * @returns {Array}
 * @private
 */
module.exports = (pattern, useCache = true) => {
  let output = _maybeGetCachedOutput(pattern, useCache)

  if (_.isPlainObject(output)) {
    return output
  }

  /** @var {Array} */
  const files = glob.sync(pattern)

  if (!files.length) {
    throw new Error(`No files were found with the following pattern: ${pattern}`)
  }

  _maybeSetCachedOutput(pattern, files, useCache)

  return files
}