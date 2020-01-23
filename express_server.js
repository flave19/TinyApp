const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookierParser = require("cookie-parser");

app.use(cookierParser());
app.set("view engine", "ejs");

//=================================================================================

const emailFinder = function (inputEmail, users){ // if email in database matches then it returns that email
  for(const user in users){
    if( users[user].email === inputEmail){
      return users[user]
    }
  }
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "aJ48lW": {
    id: "aJ48lW", 
    email: "a@a.com", 
    password: "123"
  }
}

function generateRandomString() { // generates random string used for short URLs 
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//=================================================================================
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lC" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  cfdr3v: { longURL: "https://www.reddut.ca", userID: "aJ48lW" }
};

function matchUsersUrls(cookieid) { // this function checks if the cookie id matches a userid within the database and returns only matching urls
  const empty= {};
  for(const match in urlDatabase){
    if(urlDatabase[match].userID === cookieid){
      empty[match] = urlDatabase[match];
    }
  }
return empty
}
//=================================================================================

app.use(bodyParser.urlencoded({ extended: true }));
//=================================================================================
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  console.log("hello");
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// let templateVars = { urls: matchUsersUrls(req.cookies.user_ID), user: users[req.cookies.user_ID] };

app.get("/urls", (req, res) => {
  if(req.cookies.user_ID){
    let newdatabase = matchUsersUrls(req.cookies.user_ID)
    let templateVars = { urls: newdatabase, user: users[req.cookies.user_ID] };
    res.render("urls_index", templateVars);
    console.log(urlDatabase)
  }
  else{
    res.redirect("/login")
  }
});

//=================================================================================

// app.post("/urls", (req, res) => {
//   let random = generateRandomString();

//   for(short in urlDatabase){
//     if(short.longURL === req.body.longURL){
//   //     array.push(req.cookies[user_ID])
//   //   }
//   }else {
//   urlDatabase[random] = {"longURL": req.body.longURL, "userID":request.cookies.user_id;
//   res.redirect(`/urls/${random}`);
// });

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {longURL: req.body.longURL, userID: (req.cookies.user_ID)};
  res.redirect(`/urls/${random}`);
});

app.get("/urls/new", (req, res) => {
  if(Object.entries(req.cookies).length === 0){
    res.redirect("/login")
  }
  else {
    let templateVars = {
      user: users[req.cookies.user_ID]
    };
    res.render("urls_new", templateVars)
  }
});

app.get("/register", (req,res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_ID] };
  res.render("urls_registration", templateVars)
})

app.post("/register", (req,res) => {
  let id = generateRandomString();
  const email = req.body["email"]
  const password = req.body["password"]


  if(email === '' || password === ''){
    res.statusCode = 400
    res.sendStatus(400)
  }
  else if (emailFinder(req.body.email, users)){
    res.redirect("/login")
  }
  else{
    users[id] = {
      id: id,
      email: email,
      password: password
    }
    res.cookie('user_ID', id)
    res.redirect('/urls')
  }
})

app.get("/login", (req,res) => {
  let templateVars= {
    user: users[req.cookies.user_ID]
  }
  res.render("urls_login", templateVars)
})

app.post("/login", (req,res) =>{
  let user = emailFinder(req.body.email, users)
  if(user && user.password === req.body.password){
    res.cookie("user_ID", user.id)
    res.redirect("/urls")
  } else{
    res.status(403).send("Wrong login , please try again")
  }
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_ID]
  };
  if(req.cookies.user_ID && req.cookies.user_ID === urlDatabase[req.params.shortURL].userID){
    res.render("urls_show", templateVars);
  }
  else{
    res.send (403)
    // res.redirect("/login")
  }
  // res.render("urls_show", templateVars);
});

app.get("/u/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL]
    ? res.redirect(urlDatabase[req.params.shortURL].longURL)
    : res.send(404);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.cookies.user_ID && req.cookies.user_ID === urlDatabase[req.params.shortURL].userID){
  urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: (req.cookies.user_ID)};

  res.redirect("/urls");
  }
  res.statusCode(403)
  res.send (403)
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_ID')
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
