const test = require('ava');
const { TestSubject, Mock } = require('../index');

const testSubjectPath = require.resolve('./TestProj/subject');
const dep1Path = require.resolve('./TestProj/dependency1');
const dep2Path = require.resolve('./TestProj/dependency2');
const arrayPath = require.resolve('./TestProj/arrayDependency');
const constructorPath = require.resolve('./TestProj/constructorDependency.js');
const functionPath = require.resolve('./TestProj/functionDependency');
const objectPath = require.resolve('./TestProj/objectDependency');
const valuePath = require.resolve('./TestProj/valueDependency');

const makeDepValAssertion = (testContext, testSubject, dep1Val, dep2Val) => {
  testContext.truthy(testSubject.dependency1() === dep1Val);
  testContext.truthy(testSubject.dependency2() === dep2Val);
};

test('Module path required', t => {
  t.throws(
    () => {
      TestSubject();
    }
  );
});

test('Relative path rejected', t => {
  t.throws(
    () => {
      TestSubject('./relative/path.js');
    }
  );
});

test('Module name rejected', t => {
  t.throws(
    () => {
      TestSubject('fs');
    }
  );
});

test('No overrides preserves non-mocked behavior', t => {
  const testSubject = new TestSubject(testSubjectPath);
  makeDepValAssertion(t, testSubject.generateSubject(), 1, 2);
});

test('Single mock default functionality', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const testSubject = new TestSubject(testSubjectPath, mock1);
  makeDepValAssertion(t, testSubject.generateSubject(), 3, 2);
});

test('Mock array default functionality', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const mock2 = new Mock(dep2Path, () => 4);
  const testSubject = new TestSubject(testSubjectPath, [mock1, mock2]);
  makeDepValAssertion(t, testSubject.generateSubject(), 3, 4);
});

test('Different data types', t => {
  const arr = [1, 2, 3, 4, 5];
  const obj = {a: 2};
  const val = 2;

  const pathValMappings = [
    [arrayPath, arr, []],
    [constructorPath, function () { this.a = val; }, function () { this.a = 0; }],
    [functionPath, () => val, () => val],
    [objectPath, obj, {a: 0}],
    [valuePath, val, 0]
  ];

  const mocks = pathValMappings.map(mapping => {
    return new Mock(mapping[0], mapping[1]);
  });

  const validate = (subject) => {
    t.deepEqual(subject.arrayDependency, arr);
    t.deepEqual((new subject.ConstructorDependency()).a, val);
    t.deepEqual(subject.functionDependency(), val);
    t.deepEqual(subject.objectDependency.a, val);
    t.deepEqual(subject.valueDependency, val);
  };

  const defaultMockSubject = (new TestSubject(testSubjectPath, mocks)).generateSubject();
  const overrideMockSubject = (new TestSubject(testSubjectPath)).generateSubject(mocks);

  validate(defaultMockSubject);
  validate(overrideMockSubject);

  const defaultMocks = pathValMappings.map(mapping => {
    return new Mock(mapping[0], mapping[2]);
  });

  const overrideDefaultMockSubject = (new TestSubject(testSubjectPath, defaultMocks)).generateSubject(mocks);
  validate(overrideDefaultMockSubject);
});

test('Clear mocks', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const mock2 = new Mock(dep2Path, () => 4);
  const testSubject = new TestSubject(testSubjectPath);
  makeDepValAssertion(t, testSubject.generateSubject([mock1, mock2]), 3, 4);
  testSubject.clearMocks();
  makeDepValAssertion(t, testSubject.generateSubject(), 1, 2);
});
