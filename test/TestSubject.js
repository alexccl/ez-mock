const test = require('ava');
const { TestSubjectMocker, Mock } = require('../index');

const testSubjectPath = './TestProj/subject';
const dep1Path = './TestProj/dependency1';
const dep2Path = './TestProj/dependency2';
const arrayPath = './TestProj/arrayDependency';
const constructorPath = './TestProj/constructorDependency.js';
const functionPath = './TestProj/functionDependency';
const objectPath = './TestProj/objectDependency';
const valuePath = './TestProj/valueDependency';

const makeDepValAssertion = (testContext, testSubject, dep1Val, dep2Val) => {
  testContext.truthy(testSubject.dependency1() === dep1Val);
  testContext.truthy(testSubject.dependency2() === dep2Val);
};

test('Module path required', t => {
  t.throws(
    () => {
      TestSubjectMocker();
    }
  );
});

test('Relative path rejected', t => {
  t.throws(
    () => {
      TestSubjectMocker('./relative/path.js');
    }
  );
});

test('No overrides preserves non-mocked behavior', t => {
  try {
    const testSubjectMocker = new TestSubjectMocker(testSubjectPath);
    makeDepValAssertion(t, testSubjectMocker.generateSubject(), 1, 2);
  } catch (err) {
    console.log(err);
  }
});

test('Single mock default functionality', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const testSubjectMocker = new TestSubjectMocker(testSubjectPath, mock1);
  makeDepValAssertion(t, testSubjectMocker.generateSubject(), 3, 2);
});

test('Mock array default functionality', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const mock2 = new Mock(dep2Path, () => 4);
  const testSubjectMocker = new TestSubjectMocker(testSubjectPath, [mock1, mock2]);
  makeDepValAssertion(t, testSubjectMocker.generateSubject(), 3, 4);
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

  const defaultMockSubject = (new TestSubjectMocker(testSubjectPath, mocks)).generateSubject();
  const overrideMockSubject = (new TestSubjectMocker(testSubjectPath)).generateSubject(mocks);

  validate(defaultMockSubject);
  validate(overrideMockSubject);

  const defaultMocks = pathValMappings.map(mapping => {
    return new Mock(mapping[0], mapping[2]);
  });

  const overrideDefaultMockSubject = (new TestSubjectMocker(testSubjectPath, defaultMocks)).generateSubject(mocks);
  validate(overrideDefaultMockSubject);
});

test('Clear mocks', t => {
  const mock1 = new Mock(dep1Path, () => 3);
  const mock2 = new Mock(dep2Path, () => 4);
  const testSubjectMocker = new TestSubjectMocker(testSubjectPath);
  makeDepValAssertion(t, testSubjectMocker.generateSubject([mock1, mock2]), 3, 4);
  testSubjectMocker.clearMocks();
  makeDepValAssertion(t, testSubjectMocker.generateSubject(), 1, 2);
});
