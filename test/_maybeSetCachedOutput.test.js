const assert = require('assert')
const rewire = require('rewire')
let _maybeSetCachedOutput = null

describe('_maybeSetCachedOutput', () => {
  beforeEach(() => {
    _maybeSetCachedOutput = rewire('../src/_maybeSetCachedOutput')
  })

  it('validates arguments', () => {
    const inputPattern = 'pattern'
    const inputOutput = ['abc']
    const inputUseCache = false
    let testPattern = null
    let testOutput = null
    let testUseCache = null

    _maybeSetCachedOutput.__set__('_validateCacheArgs', (args) => {
      testPattern = args.pattern
      testOutput = args.output
      testUseCache = args.useCache
    })

    _maybeSetCachedOutput(inputPattern, inputOutput, inputUseCache)

    assert.strictEqual(inputPattern, testPattern)
    assert.strictEqual(inputOutput, testOutput)
    assert.strictEqual(inputUseCache, testUseCache)
  })

  context('with useCache set to false', () => {
    it('does nothing and simply returns false', () => {
      const pattern = 'pattern/that/will/not/be/set'
      const output = ['some output that will not be set']
      const _globCache = _maybeSetCachedOutput.__get__('_globCache')

      assert.strictEqual(_maybeSetCachedOutput(pattern, output, false), false)
      assert.ok(!_globCache.hasOwnProperty(pattern))
    })

    it('creates an empty cache object property it there is not already one for the glob passed as argument', () => {
      const globPattern = 'pattern/to/cache'
      const _globCache = _maybeSetCachedOutput.__get__('_globCache')

      assert.ok(!_globCache.hasOwnProperty(globPattern))
      _maybeSetCachedOutput(globPattern, ['something'], true)
      assert.ok(_globCache.hasOwnProperty(globPattern))
    })
  })
})