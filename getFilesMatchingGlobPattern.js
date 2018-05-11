const glob = require('glob')
const _ = require('lodash')

let globCache = {}

/**
 * Takes a glob pattern as argument, checks the cache to see if data has already been requested for this pattern.
 * If there's cached data, returns it. If not, returns the matching files. Throws an exception if no files match the
 * glob pattern or if the argument passed to the glob pattern parameter is not a string.
 *
 * @param {string} globPattern
 * @returns {Array|{}}
 * @private
 */
module.exports = (globPattern) => {
  if (typeof(globPattern) !== 'string') {
    throw new Error('The glob pattern argument must be a string')
  }

  if (!globCache.hasOwnProperty(globPattern)) {
    globCache[globPattern] = {}
  }

  // return cached data if the same glob pattern has been passed previously
  if (!_.isEmpty(globCache[globPattern])) {
    return { cached: globCache[globPattern] }
  }

  /**
   * @var {Array}
   */
  const files = glob.sync(globPattern)

  globCache[globPattern] = files

  if (!files.length) {
    throw new Error(`No files were found with the following pattern: ${globPattern}`)
  }

  return files
}