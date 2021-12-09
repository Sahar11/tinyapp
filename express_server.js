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

const usersDb = { 
  "xyz123": {
    id: "xyz123", 
    email: "Ali@example.com", 
    password: "purple"
  },
 "er4vt7": {
    id: "er4vt7", 
    email: "cali@example.com", 
    password: "12345"
  }
}

//res.render("urls_index", templateVars);

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: usersDb[userId] };
  res.render("urls_new", templateVars);
});

//// Saving new URLs ////
app.post("/urls", (req, res) => {
  //console.log(urlDatabase);
  const userId = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = (Math.random() + 1).toString(36).substring(7); //generateRandomString();
  urlDatabase[shortURL] = longURL;
  const templateVars = { urls: urlDatabase, user: usersDb[userId]  };
  res.redirect(`/urls/${shortURL}`, templateVars);

});
 
////////// displaying the webpage from the long URL ////////
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL]['longURL']);
  } 
});
/////// Displaying Registration page////////
app.get('/register', (req, res) => {
  //const userId = req.cookie['user_id'];
  const templateVars =  {user: null}
  res.render('register', templateVars);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});
////////Register//////////////
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let userId in usersDb) {
    const user = usersDb[userId];
    if(user.email === email ) {
      res.status(403).send('Sorry user already exists');
      return;
    } else if (email === "" || password === "") {
      res.status(403).send('Please enter email and password');
      return;
    }
  }

  const userId = (Math.random() + 1).toString(36).substr(2, 8); //generateRandomString();

  newUser = {
    id: userId,
    email,
    password
  }
   usersDb[userId] = newUser;
  res.cookie('user_id', userId);
  console.log(userId);
  res.redirect('/urls');
});
/////////////Register Ends///////////////


//////Rendering Database/////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



////////// Displaying User's URLs /////////////
app.get("/urls", (req, res) => {
  

   if(req.cookies['user_id']) {
  console.log(req.cookies['user_id']);

  const userId = req.cookies['user_id'];
  
  const templateVars = { urls: urlDatabase, user: usersDb[userId] };
  res.render("urls_index", templateVars);
   } 
    const templateVars = { urls: {}, user: '',};
  //console.log(req.cookie.user_id);
  res.render("urls_index", templateVars);
   
});


app.get("/urls/:shortURL", (req, res) => {
  // const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  console.log(userId);
  const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL , user: usersDb[userId]};
  console.log(templateVars);
  res.render("urls_show", templateVars);
});
//*******Delete****** */
app.post("/urls/:shortURL/delete", (req, res) => {
const shortURL = req.params.shortURL;
delete urlDatabase[shortURL];
res.redirect("/urls");

});
//*******UPDATE****** */
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const updatedURL = req.body.updatedURL;
  urlDatabase[shortURL] = updatedURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

///login////
app.post("/login", (req, res, db) => {
  
  const useremail = req.body.email;
  if (userEmail !== userDb[email]) 
   res.cookie('user_id', userId);
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
    user: req.cookies.user_id,
  };
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});