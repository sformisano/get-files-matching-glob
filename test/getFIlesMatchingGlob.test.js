const assert = require('assert')
const rewire = require('rewire')
const ctx = this

describe('getFilesMatchingGlob function', () => {
  beforeEach(() => {
    ctx.getFilesMatchingGlob = rewire('../getFilesMatchingGlob')
  })

  it('throws an error if the glob pattern argument is not a string', () => {
    const invalidGlobPatterns = [true, false, 5, 1.9, undefined, null, {}]

    invalidGlobPatterns.forEach(arg => {
      assert.throws(() => {
        ctx.getFilesMatchingGlob(arg)
      }, (err) => {
        return (err instanceof Error) &&
          /The glob pattern argument must be a string/.test(err.toString())
      })
    })
  })

  it('throws an error if the useCache argument is not a boolean', () => {
    const invalidGlobPatterns = [5, 1.9, null, {}, 'hello']

    invalidGlobPatterns.forEach(arg => {
      assert.throws(() => {
        ctx.getFilesMatchingGlob('pattern', arg)
      }, (err) => {
        return (err instanceof Error) &&
          /The useCache argument must be a boolean/.test(err.toString())
      })
    })
  })


  context('with useCache set to true', () => {
    it('creates an empty cache object property it there is not already one for the glob passed as argument', () => {
      const globPattern = 'pattern/to/cache'
      const cache = ctx.getFilesMatchingGlob.__get__('globCache')

      ctx.getFilesMatchingGlob.__set__('glob', {
        sync: () => {
          return ['simulate non empty output']
        }
      })

      assert.ok(!cache.hasOwnProperty(globPattern))
      ctx.getFilesMatchingGlob(globPattern)
      assert.ok(cache.hasOwnProperty(globPattern))
    })

    it('returns cached data if the cache argument has a property whose key equals the glob pattern argument', () => {
      let globCache = ctx.getFilesMatchingGlob.__get__('globCache')

      ctx.getFilesMatchingGlob.__set__('glob', {
        sync: (patternArg) => {
          return test[patternArg]
        }
      })

      const test = {}
      const pattern = 'some/test/pattern'
      const match1 = ['matching-file1.js']
      const match2 = ['matching-file2.js']

      test[pattern] = match1
      const output1 = ctx.getFilesMatchingGlob(pattern)

      assert.strictEqual(output1, match1)

      test[pattern] = match2
      const output2 = ctx.getFilesMatchingGlob(pattern)

      // needs to be still equal despite test[pattern] being set to equal match2, because
      // it's supposed to return the previously cached result for the same pattern
      assert.strictEqual(output2, match1)
    })
  })

  context('with useCache set to false', () => {

    it('does NOT create cache entries', () => {
      const globPattern = 'pattern/to/cache'
      const cache = ctx.getFilesMatchingGlob.__get__('globCache')

      ctx.getFilesMatchingGlob.__set__('glob', {
        sync: () => {
          return ['simulate non empty output']
        }
      })

      assert.ok(!cache.hasOwnProperty(globPattern))
      ctx.getFilesMatchingGlob(globPattern, false)
      assert.ok(!cache.hasOwnProperty(globPattern))
    })

    it('does NOT return any cached data even if it matches the glob pattern argument', () => {
      let globCache = ctx.getFilesMatchingGlob.__get__('globCache')

      ctx.getFilesMatchingGlob.__set__('glob', {
        sync: (patternArg) => {
          return test[patternArg]
        }
      })

      const test = {}
      const pattern = 'some/test/pattern'
      const match1 = ['matching-file1.js']
      const match2 = ['matching-file2.js']

      test[pattern] = match1
      const output1 = ctx.getFilesMatchingGlob(pattern)

      assert.strictEqual(output1, match1)

      test[pattern] = match2
      const output2 = ctx.getFilesMatchingGlob(pattern, false)

      // needs to be still equal despite test[pattern] being set to equal match2, because
      // it's supposed to return the previously cached result for the same pattern
      assert.strictEqual(output2, match2)
    })
  })

  it('passes the glob pattern passed as argument to the internal glob.sync call ', () => {
    const globPattern = 'pattern/received/by/glob/sync'
    const validGlobSyncOutput = [globPattern]

    ctx.getFilesMatchingGlob.__set__('glob', {
      sync: (globPatternArg) => {
        // using this approach to have same object which works well with strictEqual
        if (globPatternArg === globPattern) {
          return validGlobSyncOutput
        }

        throw new Error('glob.sync did not receive the glob pattern passed as argument')
      }
    })

    assert.strictEqual(ctx.getFilesMatchingGlob(globPattern), validGlobSyncOutput)
  })

  it('throws an error if the glob pattern argument does not match any files', () => {
    ctx.getFilesMatchingGlob.__set__('glob', {
      sync: (pattern) => {
        return []
      }
    })

    const globPattern = '/somewhere/with/no/matches'
    const noFilesErrorMsg = `No files were found with the following pattern: ${globPattern}`
    const noFilesRegex = new RegExp(noFilesErrorMsg)

    assert.throws(() => {
      ctx.getFilesMatchingGlob(globPattern)
    }, (err) => {
      return (err instanceof Error) && noFilesRegex.test(err.toString())
    })
  })

  it('returns the output of glob.sync if it is a non empty array', () => {
    const output = ['array item 1', 'array item 2', 'array item x']

    ctx.getFilesMatchingGlob.__set__('glob', {
      sync: () => {
        return output
      }
    })

    assert.strictEqual(ctx.getFilesMatchingGlob(''), output)
  })
})