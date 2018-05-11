const glob = require('glob')
const _ = require('lodash')

let globCache = {}

/**
 * Takes a glob pattern as argument, checks the cache to see if data has already been requested for this pattern.
 * If there's cached data, returns it. If not, returns the matching files. Throws an exception if no files match the
 * glob pattern or if the argument passed to the glob pattern parameter is not a string.
 *
 * @param {string} pattern
 * @param {Boolean} useCache
 * @returns {Array|{}}
 * @private
 */
module.exports = (pattern, useCache = true) => {
  if (typeof(pattern) !== 'string') {
    throw new Error('The glob pattern argument must be a string')
  }

  if (typeof(useCache) !== 'boolean') {
    throw new Error('The useCache argument must be a boolean')
  }

  if (useCache && !globCache.hasOwnProperty(pattern)) {
    globCache[pattern] = {}
  }

  if (useCache && !_.isEmpty(globCache[pattern])) {
    return globCache[pattern]
  }

  /**
   * @var {Array}
   */
  const files = glob.sync(pattern)

  if (useCache) {
    globCache[pattern] = files
  }

  if (!files.length) {
    throw new Error(`No files were found with the following pattern: ${pattern}`)
  }

  return files
}