const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const bodyParser = require("body-parser");
const { name } = require("ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const { generateRandomString, getUserByEmail } = require("./helpers");

const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["lighthouse"],
}));

/****URL Database ****/
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "er4vt7"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "xyz123"
  }
};
/**** Users Database ****/
const usersDb = {
  "xyz123": {
    id: "xyz123",
    email: "Ali@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "er4vt7": {
    id: "er4vt7",
    email: "cali@example.com",
    password: bcrypt.hashSync("12345", 10)
  }
}

////////url for specified user///////////
const urlsForUserId = (id) => {
  const result = {};
  for (const shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;
};

/* Verify if this link being edited belongs to logged in user */
const isUsersLink = (object, id) => {
  let usersObject = {};
  for (let key in object) {
    if (object[key].userID === id) {
      usersObject[key] = object[key];
    }
  }
  return usersObject;
}

/****************GENERATE A NEW URL*************/
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session['user_id'];

  if (!userID) {
    return res.status(401).render('You must <a href ="/login" >login</a> first. ');
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  console.log("++++++", urlDatabase);
  res.redirect(`/urls/${shortURL}`);

});

/*****GET New Url creation Page *****/
app.get("/urls/new", (req, res) => {

  if (req.session['user_id']) {
    const user_id = req.session['user_id'];
    const templateVars = { urls: urlDatabase, user: usersDb[user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});
// displaying the webpage from the long URL //
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[req.params.id];
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect(404, "/urls/new");
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// Displaying Registration page//
app.get('/register', (req, res) => {

  const templateVars = { user: null }
  res.render('register', templateVars);
});

// Displaying Users Database //
app.get("/users.json", (req, res) => {
  res.json(usersDb);
});

// Register //
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDb);
  if (user) {
    return res.status(403).send('Sorry user already exists');

  } else if (email === "" || password === "") {
    return res.status(403).send('Please enter email and password');

  }
  const userId = generateRandomString();

  newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  } 
  usersDb[userId] = newUser;
  req.session.user_id = userId;
  console.log(newUser);
  res.redirect('/urls');
});
/////////////Register Ends///////////////

//////Rendering Database/////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//////////////login get//////////////
app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});

///////////login post/////////

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, usersDb);
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403);
    res.render("login", { error: "User not found" });
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

////logout////
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect('/login');
});


/******  Private /url endpoints ********/
app.get("/urls", (req, res) => {

  const id = req.session.user_id;
  const user = usersDb[id];
  if (!user) {
    //return res.status(401).send("You must <a href='/login'>login</a> first. ");
    res.redirect("/login");
  }
  const urls = urlsForUserId(id);
  const templateVars = { urls, user };
  return res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {

  const user_id = req.session.user_id;
  const userID = usersDb[user_id];
  if (!user_id || !user) {
    res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  const templateVars = { shortURL, url, userID };
  res.render("urls_show", templateVars);
});

/*******Delete****** */
app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  const user_id = req.session['user_id'];
  const url = urlDatabase[shortURL];
  const user = usersDb[user_id];
  if (user)
    delete urlDatabase[shortURL];
  res.redirect("/urls");

});

//*******GET Edit PAGE****** */
app.get("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (req.session['user_id']) {
    const userId = req.session['user_id'];
    const user_id = req.params.id;

    const templateVars = { urls: urlDatabase, user: usersDb[userId], shortURL, longURL: urlDatabase[shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/urls');
  }
});
//*******Edit URL****** */
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  let usersObj = isUsersLink(urlDatabase, userId);
  if (usersObj[shortURL]) {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  } else {
    return res.status(401).send("You do not have access to edit this URL. ");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
