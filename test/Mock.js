const test = require('ava');
const { Mock } = require('../index');

test('Module path required', t => {
  t.throws(
    () => {
      Mock();
    }
  );
});

test('Module name accepted as path', t => {
  const mock = new Mock('fs');
  t.truthy(mock.path = require.resolve('fs'));
});

test('Relative path accepted as path', t => {
  const mock = new Mock('./TestProj/dependency1');
  t.truthy(mock.path = require.resolve('./TestProj/dependency1.js'));
});

test('Absolute path accepted as path', t => {
  const mock = new Mock(require.resolve('fs'));
  t.truthy(mock.path = require.resolve('fs'));
});
