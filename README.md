# ez-mock
![alt text](https://www.travis-ci.org/alexccl/ez-mock.svg?branch=master "Travis CI build status")

#### Simple mocking of require modules.

## About
I found myself repeating a similar pattern for setting up mocks for unit tests.  This package encapsulates that pattern and provides a simple, yet robust, interface.

## Example
We want to test a simple module `addToDBValue.js` that adds an input value to a database value.

```javascript
// addToDBValue.js
const queryDatabase = require('./database.js');

const addToDBValue = (inputValue) => {
  return inputValue + queryDatabase();
}

module.exports = addToDBValue;
```

The only issue is that `database.js` connects to an actual database.

```javascript
// database.js
const queryDatabase = () => {
  /* database connection and query logic */
}

module.exports = queryDatabase;
```
But we don't want to touch any external systems for a unit test...  We can simply mock that required dependency

```javascript
// test.js
const {Mock, TestSubjectMocker} = require('ez-mock');

// database mock behavior that returns 1 from query
const databaseMockReturn1 = new Mock('./database.js', () => 1);

// database mock behavior that returns 2 from query
const databaseMockReturn2 = new Mock('./database.js', () => 2);

// set the default database mock to return 1 from query
const testSubjectMocker = new TestSubjectMocker('./addToDBValue.js', databaseMockReturn1);

// instantiate foo using the default database mock
let addToDBValue = testSubjectMocker.generateSubject();
console.log(addToDBValue(1)); // 2
console.log(addToDBValue(2)); // 3

// instantiate foo with an override mock behavior
addToDBValue = testSubjectMocker.generateSubject(databaseMockReturn2);
console.log(addToDBValue(1)); // 3
console.log(addToDBValue(2)); // 4
```

## API

### `Mock(modulePath, functionality)`

__modulePath__: `String`

The module name, absolute path, or relative path to the module you wish to mock.

__functionality__ : `object/function`

The functionality you wish to return when `require(...)` is called.

### `TestSubjectMocker(modulePath, defaultMocks)`

__modulePath__: `String`

The module name, absolute path, or relative path to the module you wish to test with its dependencies mocked.

__defaultMocks__ : `Mock/[Mock]`

The mock behavior that will always be applied when generating a test subject.

### `TestSubjectMocker.generateTestSubject(overrideMocks)`

__defaultMocks__ : `Mock/[Mock]`

The mock behavior that overrides the default behavior for this instance of the test subject.

__returns__ : `object/function`

An instance of the test subject with the mocks applied

### `TestSubjectMocker.clearMocks()`

Clears all registered mocks (even the default mocks)

