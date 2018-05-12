module.exports = (args) => {
  if (args.hasOwnProperty('pattern') && typeof(args.pattern) !== 'string') {
    throw new Error('The glob pattern argument must be a string')
  }

  if (args.hasOwnProperty('useCache') && typeof(args.useCache) !== 'boolean') {
    throw new Error('The useCache argument must be a boolean')
  }

  if (args.hasOwnProperty('output') && !Array.isArray(args.output)) {
    throw new Error('The output argument must be an Array')
  }
}