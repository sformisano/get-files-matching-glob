const assert = require('assert')
const rewire = require('rewire')
let _maybeGetCachedOutput = null

describe('_maybeGetCachedOutput function', () => {
  beforeEach(() => {
    _maybeGetCachedOutput = rewire('../src/_maybeGetCachedOutput')
  })

  it('validates arguments', () => {
    const inputPattern = 'patterrrn'
    const inputUseCache = false
    let testPattern, testUseCache

    _maybeGetCachedOutput.__set__('_validateCacheArgs', (args) => {
      testPattern = args.pattern
      testUseCache = args.useCache
    })

    _maybeGetCachedOutput(inputPattern, inputUseCache)

    assert.strictEqual(inputPattern, testPattern)
    assert.strictEqual(inputUseCache, testUseCache)
  })

  context('with useCache set to true', () => {
    it('returns null if pattern is not found in cache', () => {
      // cache empty by default, no need to mock
      assert.strictEqual(_maybeGetCachedOutput('some/pattern', true), null)
    })

    it('returns the cached value if cache contains pattern argument', () => {
      const globPattern = 'some/pattern'
      const cacheValue = 'some value'
      const _globCache = {
        [globPattern]: cacheValue
      }
      _maybeGetCachedOutput.__set__('_globCache', _globCache)
      assert.strictEqual(_maybeGetCachedOutput(globPattern, true), cacheValue)
    })
  })

  context('with useCache set to false', () => {
    it('returns null if pattern is not found in cache', () => {
      // cache empty by default, no need to mock
      assert.strictEqual(_maybeGetCachedOutput('some/pattern', false), null)
    })

    it('returns null even if cache contains pattern argument', () => {
      const globPattern = 'some/pattern'
      const cacheValue = 'some value'
      const globCache = {
        [globPattern]: cacheValue
      }
      _maybeGetCachedOutput.__set__('globCache', globCache)
      assert.strictEqual(_maybeGetCachedOutput(globPattern, false), null)
    })
  })
})
