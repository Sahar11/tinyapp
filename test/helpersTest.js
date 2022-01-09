const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

// getUserByEmail Test
const testUsers = {
  'wereho123': {
    id: 'wereho123',
    email: 'yes@example.com',
    password: 'secret'
  },
  'ftyr46y': {
    id: 'ftyr46y',
    email: 'noon@example.com',
    password: 'xyz123'
  }
};

describe('getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('noon@example.com', testUsers);
    assert.equal(user, testUsers.ftyr46y);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('stop@example.com', testUsers);
    assert.equal(user, undefined);
  });
});