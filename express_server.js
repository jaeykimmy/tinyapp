const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { restart } = require("nodemon");
const { generateRandomString, urlsForUser } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['wadjhbasybdejhc'],
  maxAge: 24 * 60 * 60 * 1000
}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk")
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("admin")
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
    password: bcrypt.hashSync(req.body.password, 10)
  };
  if (req.body.email === "" || req.body.password === '') {
    return res.status(400).send("no email or password entered");
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).send("email already registered");
    } else {
      req.session['user_id'] = userID;
      return res.redirect(`/urls`);
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post('/login', (req, res) => {
  for (let user in users) {
    if (req.body.email === users[user].email) {
      if (!bcrypt.compareSync(req.body.password, users[user].password)) {
        return res.status(403).send("non-matching password");
      } else {
        req.session['user_id'] = users[user].id;
        return res.redirect(`/urls`);
      }
    }
  }
  return res.status(403).send("email not found");
});

app.post("/urls", (req, res) => {
  let randomID = generateRandomString();
  if (!req.session['user_id']) {
    return res.status(403).send("not signed in");
  } else {
    urlDatabase[randomID] = {
      longURL: req.body.longURL,
      userID: req.session['user_id']
    };
    res.redirect(`/urls/${randomID}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
//makes sure appropriate user is using the delete url function
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.session['user_id']) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect(`/urls`);
    }
  }
  return res.status(403).send("you cannot delete someone elses url");
});

app.post("/urls/:shortURL", (req, res) => {
  if (!req.session['user_id']) {
    return res.status(403).send("register or log in please");
  } else {
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === req.session['user_id']) {
        urlDatabase[req.params.shortURL] = {
          longURL: req.body.longURL,
          userID: req.session['user_id']
        };
        return res.redirect(`/urls/${req.params.shortURL}`);
      }
    }
    return res.status(403).send("you cannot edit someone elses url");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(403).send("short url doesnt exist");
  }
});

app.get("/register", (req, res) => {
  if (req.session['user_id']) {
    res.redirect(`/urls`);
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session['user_id']]
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session['user_id']) {
    res.redirect(`/urls`);
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session['user_id']]
    };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['user_id']]
  };
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }

});

app.get("/urls", (req, res) => {
  if (!req.session['user_id']) {
    return res.status(403).send("register or log in please");
  } else {
    const templateVars = {
      urls: urlsForUser(req.session['user_id'], urlDatabase),
      user: users[req.session['user_id']]
    };
    return res.render('urls_index', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session['user_id']) {
    return res.status(403).send("register or log in please");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session['user_id']]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get('/', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});