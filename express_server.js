const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookierParser = require("cookie-parser");

const emailFinder = function (inputEmail, users){ 
  for(const user in users){
    if( users[user].email === inputEmail){
      return users[user]
    }
  }
}

const users = {}

app.use(cookierParser());

function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_ID] };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;

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
  // if(req.body.email === users[req.cookies.user_ID]){
  //   res.redirect("/login")
  // }
  // else{
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

// const findUser = username => usersDb.find(user => user.username === username)

//  const validateUser = (username, password) => usersDb.find(user => user.username === username && user.password === password);

app.post("/login", (req,res) =>{
  let user = emailFinder(req.body.email, users)
  if(user && user.password === req.body.password){
    res.cookie("user_ID", user.id)
    res.redirect("/urls")
  } else{
    res.status(403).send("wrong password , please try again")
  }
})
//   if(keyfinder(req.body.email) === true && validatepassword(req.body.password) === true){
//     res.cookie("user_ID", users[req.cookies.user_ID]);
//     res.redirect("/urls");
//   }
//   else if (keyfinder(req.body.email) === true && validatepassword(req.body.password) === false){
//     res.sendStatus(403)
//   }
//   else( )



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_ID]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL]
    ? res.redirect(urlDatabase[req.params.shortURL])
    : res.send(404);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  /// 
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {
//   res.cookie("user_ID", req.body.user_id);
//   res.redirect("/url_login");
// });

app.post("/logout", (req,res) => {
  res.clearCookie('user_ID')
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
