const getUserByEmail = function (inputEmail, userdatabase){ // if email in database matches then it returns that email
  for(const user in userdatabase){
    if( userdatabase[user].email === inputEmail){
      return userdatabase[user]
    }
  }
}

function generateRandomString() { // generates random string used for short URLs 
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz1234567890";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function matchUsersUrls(sessionid, database) { // this function checks if the session id matches a userid within the database and returns only matching urls
  const empty= {};
  for(const match in database){
    if(database[match].userID === sessionid){
      empty[match] = database[match];
    }
  }
return empty
}

module.exports={getUserByEmail, generateRandomString, matchUsersUrls}