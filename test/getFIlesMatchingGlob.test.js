const assert = require('assert')
const rewire = require('rewire')
let getFilesMatchingGlob = null

describe('getFilesMatchingGlob function', () => {
  beforeEach(() => {
    getFilesMatchingGlob = rewire('../getFilesMatchingGlob')
  })

  context('always', () => {
    it('throws an error if the glob pattern argument is not a string', () => {
      const invalidGlobPatterns = [true, false, 5, 1.9, undefined, null, {}]

      invalidGlobPatterns.forEach(invalidGlobPattern => {
        assert.throws(() => {
          getFilesMatchingGlob(invalidGlobPattern)
        }, (err) => {
          return (err instanceof Error) &&
            /The glob pattern argument must be a string/.test(err.toString())
        })
      })
    })

    it('throws an error if the useCache argument is not a boolean', () => {
      const invalidGlobPatterns = [5, 1.9, null, {}, 'hello']

      invalidGlobPatterns.forEach(invalidUseCache => {
        assert.throws(() => {
          getFilesMatchingGlob('pattern', invalidUseCache)
        }, (err) => {
          return (err instanceof Error) &&
            /The useCache argument must be a boolean/.test(err.toString())
        })
      })
    })

    it('passes the glob pattern argument to the internal glob.sync call ', () => {
      const globPattern = 'pattern/received/by/glob/sync'
      const validGlobSyncOutput = ['some-file.js']

      getFilesMatchingGlob.__set__('glob', {
        sync: (globPatternArg) => {
          // using this approach to have same object which works well with strictEqual
          if (globPatternArg === globPattern) {
            return validGlobSyncOutput
          }

          throw new Error('glob.sync did not receive the glob pattern argument')
        }
      })

      assert.strictEqual(getFilesMatchingGlob(globPattern), validGlobSyncOutput)
    })

    it('throws an error if the glob pattern argument does not match any files', () => {
      getFilesMatchingGlob.__set__('glob', {
        // faking no matches
        sync: () => {
          return []
        }
      })

      const globPattern = '/somewhere/with/no/matches'
      const noFilesErrorMsg = `No files were found with the following pattern: ${globPattern}`
      const noFilesRegex = new RegExp(noFilesErrorMsg)

      assert.throws(() => {
        getFilesMatchingGlob(globPattern)
      }, (err) => {
        return (err instanceof Error) && noFilesRegex.test(err.toString())
      })
    })

    it('returns the output of glob.sync if it is a non empty array', () => {
      const output = ['array item 1', 'array item 2', 'array item x']

      getFilesMatchingGlob.__set__('glob', {
        sync: () => {
          return output
        }
      })

      assert.strictEqual(getFilesMatchingGlob(''), output)
    })
  })

  context('with useCache set to true', () => {
    it('creates an empty cache object property it there is not already one for the glob passed as argument', () => {
      const globPattern = 'pattern/to/cache'
      const globCache = getFilesMatchingGlob.__get__('globCache')

      getFilesMatchingGlob.__set__('glob', {
        sync: () => {
          return ['simulate non empty output']
        }
      })

      assert.ok(!globCache.hasOwnProperty(globPattern))
      getFilesMatchingGlob(globPattern)
      assert.ok(globCache.hasOwnProperty(globPattern))
    })

    it('returns cached data if the cache argument has a property whose key equals the glob pattern argument', () => {
      const test = {}
      const pattern = 'some/test/pattern'
      const match = ['matching-file1.js']

      getFilesMatchingGlob.__set__('glob', {
        sync: (patternArg) => {
          return test[patternArg]
        }
      })

      test[pattern] = match
      const output1 = getFilesMatchingGlob(pattern)

      assert.strictEqual(output1, match)

      test[pattern] = null
      const output2 = getFilesMatchingGlob(pattern)

      // needs to be still equal to match despite test[pattern] being set to equal null,
      // because it's supposed to return the previously cached result for the same pattern
      assert.strictEqual(output2, match)
    })
  })

  context('with useCache set to false', () => {
    it('does NOT create cache entries', () => {
      const globPattern = 'pattern/to/cache'
      const cache = getFilesMatchingGlob.__get__('globCache')

      getFilesMatchingGlob.__set__('glob', {
        sync: () => {
          return ['simulate non empty output']
        }
      })

      assert.ok(!cache.hasOwnProperty(globPattern))
      getFilesMatchingGlob(globPattern, false)
      assert.ok(!cache.hasOwnProperty(globPattern))
    })

    it('does NOT return any cached data even if it matches the glob pattern argument', () => {
      const test = {}
      const pattern = 'some/test/pattern'
      const match1 = ['matching-file1.js']
      const match2 = ['matching-file2.js']

      getFilesMatchingGlob.__set__('glob', {
        sync: (patternArg) => {
          return test[patternArg]
        }
      })

      test[pattern] = match1
      const output1 = getFilesMatchingGlob(pattern)

      assert.strictEqual(output1, match1)

      test[pattern] = match2
      const output2 = getFilesMatchingGlob(pattern, false)

      // needs to be still equal despite test[pattern] being set to equal match2, because
      // it's supposed to return the previously cached result for the same pattern
      assert.strictEqual(output2, match2)
    })
  })


})