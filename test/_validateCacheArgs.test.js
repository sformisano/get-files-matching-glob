const assert = require('assert')
const rewire = require('rewire')
let _validateCacheArgs = null


describe('_validateCacheArgs function', () => {
  beforeEach(() => {
    _validateCacheArgs = rewire('../src/_validateCacheArgs')
  })

  it('throws an error if the pattern argument exists and is not a string', () => {
    const invalidGlobPatterns = [true, false, 5, 1.9, undefined, null, {}]

    invalidGlobPatterns.forEach(pattern => {
      assert.throws(() => {
        _validateCacheArgs({ pattern })
      }, (err) => {
        return (err instanceof Error) &&
          /The glob pattern argument must be a string/.test(err.toString())
      })
    })
  })

  it('throws an error if the useCache argument exists and is not a boolean', () => {
    const invalidUseCache = [5, 1.9, null, {}, 'hello', ['ciao']]

    invalidUseCache.forEach(useCache => {
      assert.throws(() => {
        _validateCacheArgs({ useCache })
      }, (err) => {
        return (err instanceof Error) &&
          /The useCache argument must be a boolean/.test(err.toString())
      })
    })
  })

  it('throws an error if the output argument exists and is not an array', () => {
    const invalidOutput = [5, 1.9, null, {}, 'hello', true]

    invalidOutput.forEach(output => {
      assert.throws(() => {
        _validateCacheArgs({ output })
      }, (err) => {
        return (err instanceof Error) &&
          /The output argument must be an Array/.test(err.toString())
      })
    })
  })
})