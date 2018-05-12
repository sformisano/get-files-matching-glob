const assert = require('assert')
const rewire = require('rewire')
let getFilesMatchingGlob = null

describe('getFilesMatchingGlob function', () => {
  beforeEach(() => {
    getFilesMatchingGlob = rewire('../src/getFilesMatchingGlob')
    getFilesMatchingGlob.__set__('glob', {
      sync: () => {
        return ['default non empty files array element']
      }
    })
  })

  context('always', () => {
    it('passes the glob pattern argument to the internal glob.sync call', () => {
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
    it('returns cached data if the _maybeGetCachedOutput function returns an object', () => {
      const cachedOutput = {
        something: 'hello world'
      }

      getFilesMatchingGlob.__set__('_maybeGetCachedOutput', () => {
        return cachedOutput
      })

      assert.strictEqual(getFilesMatchingGlob(''), cachedOutput)
    })

    it('does not return cached data if the _maybeGetCachedOutput function returns null', () => {
      const globOutput = ['output-file.js']

      getFilesMatchingGlob.__set__('_maybeGetCachedOutput', () => {
        return null
      })

      getFilesMatchingGlob.__set__('glob',  {
        sync: () => {
          return globOutput
        }
      })

      assert.strictEqual(getFilesMatchingGlob(''), globOutput)
    })
  })

  context('with useCache set to false', () => {
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