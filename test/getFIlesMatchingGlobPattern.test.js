const assert = require('assert')
const rewire = require('rewire')
const ctx = this

describe('getFilesMatchingGlobPattern function', () => {
  beforeEach(() => {
    ctx.getFilesMatchingGlobPattern = rewire('../getFilesMatchingGlobPattern')
  })
  
  it('throws an error if the glob pattern argument is not a string', () => {
    const invalidGlobPatterns = [true, false, 5, 1.9, undefined, null, {}]

    invalidGlobPatterns.forEach(arg => {
      assert.throws(() => {
        ctx.getFilesMatchingGlobPattern(arg, {})
      }, (err) => {
        return (err instanceof Error) && /The glob pattern argument must be a string/.test(err.toString())
      })
    })
  })

  it('creates an empty cache object it there is not already one for the glob passed as argument', () => {
    const globPattern = 'pattern/to/cache'
    const cache = ctx.getFilesMatchingGlobPattern.__get__('globCache')

    ctx.getFilesMatchingGlobPattern.__set__('glob', {
      sync: () => {
        return ['simulate non empty output']
      }
    })

    assert.ok(!cache.hasOwnProperty(globPattern))
    ctx.getFilesMatchingGlobPattern(globPattern)
    assert.ok(cache.hasOwnProperty(globPattern))
  })

  it('internal glob.sync call receives the glob pattern passed as argument', () => {
    const globPattern = 'pattern/received/by/glob/sync'
    const validGlobSyncOutput = [globPattern]

    ctx.getFilesMatchingGlobPattern.__set__('glob', {
      sync: (globPatternArg) => {
        // using this approach to have same object which works well with strictEqual
        if (globPatternArg === globPattern) {
          return validGlobSyncOutput
        }

        throw new Error('glob.sync did not receive the glob pattern passed as argument')
      }
    })

    assert.strictEqual(ctx.getFilesMatchingGlobPattern(globPattern, {}), validGlobSyncOutput)
  })

  it('throws an error if the glob pattern argument does not match any files', () => {
    ctx.getFilesMatchingGlobPattern.__set__('glob', {
      sync: (pattern) => {
        return []
      }
    })

    const globPattern = '/somewhere/with/no/matches'
    const noFilesErrorMsg = `No files were found with the following pattern: ${globPattern}`
    const noFilesRegex = new RegExp(noFilesErrorMsg)

    assert.throws(() => {
      ctx.getFilesMatchingGlobPattern(globPattern, {})
    }, (err) => {
      return (err instanceof Error) && noFilesRegex.test(err.toString())
    })
  })

  it('returns the output of glob.sync if it is a non empty array', () => {
    const output = ['array item 1', 'array item 2', 'array item x']

    ctx.getFilesMatchingGlobPattern.__set__('glob', {
      sync: () => {
        return output
      }
    })

    assert.strictEqual(ctx.getFilesMatchingGlobPattern('', {}), output)
  })

  it('returns cached data if the cache argument has a property whose key equals the glob pattern argument', () => {
    const testGlobPattern = './some/glob/pattern/'
    const testData = 'cached data to return'
    let testCache = ctx.getFilesMatchingGlobPattern.__get__('globCache')
    testCache[testGlobPattern] = testData

    const output = ctx.getFilesMatchingGlobPattern(testGlobPattern)

    assert.strictEqual(output.cached, testData)
  })
})