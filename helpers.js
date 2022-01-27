
const generateRandomString = function() {
  let result           = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //62 possible characters, we want the url to be 6 characters long
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  let finalURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      finalURLS[url] = urlDatabase[url];
    }
  }
  return finalURLS;
};

module.exports = {generateRandomString, getUserByEmail, urlsForUser};