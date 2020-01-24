const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const userdatabase = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", userdatabase)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  });
  it('should return undefined if email doesnt exist', function() {
    const user = getUserByEmail("user123@example.com", userdatabase)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});