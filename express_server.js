const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { name } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");
// activate cookie parser => req.cookies
app.use(cookieParser());
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const urlDatabase = {
  
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
let login = [
  'name'
]

//res.render("urls_index", templateVars);

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  //console.log(urlDatabase);
  const longURL = req.body.longURL;
  const shortURL = (Math.random() + 1).toString(36).substring(7); //generateRandomString();
  urlDatabase[shortURL] = longURL;
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.redirect(`/urls/${shortURL}`, templateVars);

});
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL]['longURL']);
  } 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  //const username = req.body.username;
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // const shortURL = req.params.shortURL;
  // const longURL = req.body.longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL , username: req.cookies.username};
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
const shortURL = req.params.shortURL;
delete urlDatabase[shortURL];
res.redirect("/urls");

});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const updatedURL = req.body.updatedURL;
  urlDatabase[shortURL] = updatedURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

///login////
app.post("/login", (req, res) => {
  //console.log(username);
  const username = req.body.username;
  //login.push(username);
  res.cookie('username', req.body.username);

  //console.log(username);
  res.redirect('/urls');
}) ;
///login get///
// app.get("/login", (req, res) => {
//   const templateVars = {
//     username: req.cookies.username,
//   };
  
//   res.render("/urls", templateVars);
// });
//logout//
app.post("/logout", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});