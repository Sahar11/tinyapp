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
    if(user.email === email ) {
      return user;
    }
  }
  return null;
};

module.exports = { generateRandomString, getUserByEmail};