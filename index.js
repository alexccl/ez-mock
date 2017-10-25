const mock = require('mock-require');
const path = require('path');

const validateModulePath = (modulePath) => {
  if (!modulePath) throw new Error('absolute is required for constructor');

  if (!path.isAbsolute(modulePath)) throw new Error('module path must be absolute');
};

/**
 * Represents a mock module
 *
 * @param {string} modulePath - The absolute path to original module or module name
 * @param {any} functionality - The bahavior to mock
 */
function Mock (modulePath, functionality) {
  validateModulePath(modulePath);

  this.path = require.resolve(modulePath);
  this.functionality = functionality;
}

/**
 * Generator of mocked test subjects.
 *
 * @constructor
 * @param {string} path - the path to the test subject module
 * @param {Mock|[Mock]} defaultMocks - the default mock behavior
 */
function TestSubjectMocker (modulePath, defaultMocks) {
  validateModulePath(modulePath);

  const normalizeMockInput = (input) => {
    if (input) {
      if (Array.isArray(input)) return input;

      return [input];
    }

    return [];
  };

  const _defaultMocks = normalizeMockInput(defaultMocks);

  /**
   * Generates a mocked test subject
   *
   * @param {Mock|[Mock]} overrideMocks - override mock capabilities to be set on this specific test subject instance
   * @returns {Any} - A new instance of the test subject with the default mocks and default override mocks applied
   */
  this.generateSubject = (overrideMocks) => {
    const normalizedOverrides = normalizeMockInput(overrideMocks);

    const getMatchingMock = (mock, searchMocks) => {
      return searchMocks.filter(searchMock => {
        return mock.path === searchMock.path;
      });
    };

    const isObject = (item) => {
      return (typeof item === 'object' && !Array.isArray(item) && item !== null);
    };

    const getOverride = (defaultMock, override) => {
      if (isObject(defaultMock.functionality)) {
        return Object.assign({}, defaultMock.functionality, override && override.functionality);
      }

      return override ? override.functionality : defaultMock.functionality;
    };

    // apply default mocks and default overrides (if specified)
    _defaultMocks.forEach(defaultMock => {
      const override = getMatchingMock(defaultMock, normalizedOverrides)[0];
      const moduleFunctionality = getOverride(defaultMock, override);
      mock(defaultMock.path, moduleFunctionality);
      mock.reRequire(defaultMock.path);
    });

    // make sure to apply overrides even if there wasn't a default
    const overridesWithoutDefault = normalizedOverrides.filter(override => {
      return getMatchingMock(override, _defaultMocks).length === 0;
    });

    // apply the override mocks that don't have defaults
    overridesWithoutDefault.forEach(overrideMock => {
      mock(overrideMock.path, overrideMock.functionality);
      mock.reRequire(overrideMock.path);
    });

    // refresh test subject
    mock.reRequire(modulePath);
    return require(modulePath);
  };

  /**
   * Clears all mocks from require cache
   */
  this.clearMocks = mock.stopAll;
}

module.exports = {
  Mock,
  TestSubjectMocker
};
