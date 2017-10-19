/**
 * Represents a mock module
 *
 * @param {string} path - The path (relative or absolute) to original module
 * @param {any} functionality - The bahavior to mock
 */
function Mock (path, functionality) {
  this.path = path;
  this.functionality = functionality;
}