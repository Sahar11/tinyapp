//generate Random strings
const generateRandomString = function (length) {
  let result = "";
  result = (Math.random() + 1).toString(36).substr(2, 8);
  return result;
};


////////get user by email///////////
const getUserByEmail = function (email, db) {

  for (let userId in db) {
    const user = db[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
/* Checks if current cookie corresponds with a user in the userDatabase */
const cookieHasUser = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

module.exports = { generateRandomString, getUserByEmail, cookieHasUser };