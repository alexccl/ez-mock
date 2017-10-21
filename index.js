var mock = require('mock-require');

/**
 * Represents a mock module
 *
 * @param {string} path - The path (relative or absolute) to original module
 * @param {any} functionality - The bahavior to mock
 */
function Mock (path, functionality) {
  this.path = require.resolve(path);
  this.functionality = functionality;
}

/**
 * The subject under test.
 *
 * @constructor
 * @param {string} path - the path to the test subject module
 * @param {Mock|[Mock]} defaultMocks - the default mock behavior
 */
function TestSubject (path, defaultMocks) {
  const normalizeMockInput = (input) => {
    if (defaultMocks) {
      if (Array.isArray(defaultMocks)) return defaultMocks;

      return [defaultMocks];
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

    // apply default mocks and default overrides (if specified)
    _defaultMocks.forEach(defaultMock => {
      const override = getMatchingMock(defaultMock, normalizedOverrides)[0];
      const moduleFunctionality = Object.assign({}, defaultMock, override);
      mock(_defaultMocks.path, moduleFunctionality);
      mock.reRequire(_defaultMocks.path);
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
    mock.reRequire(path);
    return require(path);
  };

  /**
   * Clears all mocks from require cache
   */
  this.clearMocks = mock.stopAll;
}

module.exports = {
  Mock,
  TestSubject
};
