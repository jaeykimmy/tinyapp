const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = function() {
  let result           = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //62 possible characters, we want the url to be 6 characters long
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const users = {
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let newUser = userID;
  users[newUser] = req.body;
  users[newUser].id = userID;
  console.log(req.body);
  if (req.body.email === "" || req.body.password === '') {
    return res.status(400).send("no email or password entered");
  }
  for (let user in users) {
    if (req.body.email === users[user].email) {
      return res.status(400).send("email already registered");
    }
  }
  res.cookie('user_id', req.body);
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  //console.log(req);
  res.clearCookie('user_id', req.body);
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  console.log(req.body);
  res.cookie('user_id', req.body);
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  let randomID = generateRandomString();
  urlDatabase[randomID] = req.body.longURL;
  res.redirect(`/urls/${randomID}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL]);
  //console.log(req.body.longURL);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: req.cookies['user_id']
  };
  res.render("register",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: req.cookies['user_id']
  };
  res.render("urls_new",templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: req.cookies['user_id']
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    users: req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});