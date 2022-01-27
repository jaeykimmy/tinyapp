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

const urlsForUser = function(id) {
  let finalURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].user_id) {
      finalURLS[url] = urlDatabase[url];
    }
  }
  return finalURLS;
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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "admin@gmail.com",
    password: "admin"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  //put user information in an object
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  // let newUser = userID;
  // users[newUser] = req.body;
  // users[newUser].id = userID;
  // console.log(users);
  //console.log(req.body);
  if (req.body.email === "" || req.body.password === '') {
    return res.status(400).send("no email or password entered");
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).send("email already registered");
    } else {
      res.cookie('user_id', userID);
      return res.redirect(`/urls`);
    }
  }
});

app.post('/logout', (req, res) => {
  //console.log(req);
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.post('/login', (req, res) => {
  console.log(users);
  for (let user in users) {
    if (req.body.email === users[user].email) {
      if (req.body.password !== users[user].password) {
        return res.status(403).send("non-matching password");
      } else {
        res.cookie('user_id', users[user].id);
        return res.redirect(`/urls`);
      }
    }
  }
  return res.status(403).send("email not found");
});

app.post("/urls", (req, res) => {
  let randomID = generateRandomString();
  //console.log('userid', req.cookies['user_id']);
  if (req.cookies['user_id'] === undefined) {
    return res.status(403).send("not signed in");
  } else {
    urlDatabase[randomID] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    };
    res.redirect(`/urls/${randomID}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
//makes sure appropriate user is using the delete url function
  for (let url in urlDatabase) {
    console.log('1', urlDatabase[url].userID);
    console.log('2', req.cookies['user_id']);
    if (urlDatabase[url].userID === req.cookies['user_id']) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect(`/urls`);
    }
  }
  return res.status(403).send("you cannot delete someone elses url");
});

app.post("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL]);
  //console.log(req.body.longURL);
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  console.log(urlDatabase[req.params.shortURL]);
  //console.log(req.body.longURL);
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log('shorturl', req.params);
  console.log(Object.keys(urlDatabase));
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(403).send("short url doesnt exist");
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("register",templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("login",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  if (req.cookies['user_id'] === undefined) {
    res.redirect('/urls');
  } else {
    res.render("urls_new", templateVars);
  }

});

app.get("/urls", (req, res) => {
  //console.log(urlDatabase);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  //console.log(templateVars);
  //console.log('urls', templateVars);
  return res.render('urls_index', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL].longURL);
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});