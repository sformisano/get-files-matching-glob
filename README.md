# Utility function to cache glob results

[![Build Status](https://travis-ci.org/sformisano/getFilesMatchingGlobPattern.svg?branch=master)](https://travis-ci.org/sformisano/getFilesMatchingGlobPattern)
[![Coverage Status](https://coveralls.io/repos/github/sformisano/graphql-bundler/badge.svg?branch=master)](https://coveralls.io/github/sformisano/graphql-bundler?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/c0030cb700210507170e/maintainability)](https://codeclimate.com/github/sformisano/getFilesMatchingGlobPattern/maintainability)

Takes a glob pattern as argument, checks the cache to see if data has already been requested for this pattern. If there's cached data, returns it. If not, returns the matching files and caches them. Throws an exception if no files match the glob pattern or if the argument passed to the glob pattern parameter is not a string.

# How to use

```
const getFilesMatchingGlob = require('get-files-matching-glob-pattern')

const useCache = true // true/false to cache paths (defaults to true)
const myFiles = getFilesMatchingGlob('some/glob/string/**/*.js', useCache)

// do whatever you want with myFiles which will be an array of all the matching files found
```