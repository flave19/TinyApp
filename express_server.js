const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const {getUserByEmail, generateRandomString, matchUsersUrls} = require('./helpers')


app.use(cookieSession({
  name: 'session',
  keys: ['flavor'],
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//============================Databases============================================
const userdatabase = { 
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lC" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  cfdr3v: { longURL: "https://www.reddit.ca", userID: "aJ48lW" }
};
//===========================GET REQUESTS==========================================
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if(req.session.user_ID){
    let newdatabase = matchUsersUrls(req.session.user_ID, urlDatabase)
    let templateVars = { urls: newdatabase, user: userdatabase[req.session.user_ID] };
    res.render("urls_index", templateVars);
  }
  else{
    res.redirect("/login")
  }
});

app.get("/urls/new", (req, res) => {
  if(!req.session.user_ID){
    res.redirect("/login")
  }
  else {
    let templateVars = {
      user: userdatabase[req.session.user_ID]
    };
    res.render("urls_new", templateVars)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userdatabase[req.session.user_ID]
  };
  if(req.session.user_ID && req.session.user_ID === urlDatabase[req.params.shortURL].userID){
    res.render("urls_show", templateVars);
  }
  else{
    res.redirect("/login").res.send(403)
  }
});

app.get("/u/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL]
    ? res.redirect(urlDatabase[req.params.shortURL].longURL)
    : res.send(404);
});

app.get("/register", (req,res) => {
  let templateVars = { urls: urlDatabase, user: userdatabase[req.session.user_ID] };
  res.render("urls_registration", templateVars)
})

app.get("/login", (req,res) => {
  let templateVars= {
    user: userdatabase[req.session.user_ID]
  }
  res.render("urls_login", templateVars)
})
//============================POST REQUESTS========================================
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {longURL: req.body.longURL, userID: (req.session.user_ID)};
  res.redirect(`/urls/${random}`);
});

app.post("/register", (req,res) => {
  let id = generateRandomString();
  const email = req.body["email"]
  const password = bcrypt.hashSync (req.body["password"], 10)
  let user = getUserByEmail(req.body.email, userdatabase)

  if(!email || !req.body.password){
    res.send('Must provide email and password')
  }
  else if(user){
    res.send("User already exists, please login")
  }
  else{
    userdatabase[id] = {
      id: id,
      email: email,
      password: password
    }
    req.session.user_ID = id
    res.redirect('/urls')
  }
})

app.post("/login", (req,res) =>{
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  let user = getUserByEmail(req.body.email, userdatabase)

  if(user && bcrypt.compareSync(req.body.password, user.password)){
    req.session.user_ID = user.id
    res.redirect("/urls")
  } else{
    res.status(403).send("Wrong login , please try again")
  }
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.session.user_ID && req.session.user_ID === urlDatabase[req.params.shortURL].userID){
  urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: (req.session.user_ID)};

  res.redirect("/urls");
  }
  res.statusCode(403)
  res.send (403)
});

app.post("/logout", (req,res) => {
  req.session = null
  res.redirect("/urls")
})

app.listen(PORT);