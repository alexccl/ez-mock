const test = require('ava');
const { Mock } = require('../index');

test('Module path required', t => {
  t.throws(
    () => {
      Mock();
    }
  );
});

test('Relative path rejected', t => {
  t.throws(
    () => {
      Mock('./relative/path.js');
    }
  );
});

test('Module name rejected', t => {
  t.throws(
    () => {
      Mock('fs');
    }
  );
});
