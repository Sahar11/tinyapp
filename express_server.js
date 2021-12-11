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

// const urlDatabase = {
  
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

const generateRandomString = function (length) {
 let result = "";
 result = (Math.random() + 1).toString(36).substr(2, 8);
 return result;
};

const urlsForUserId = function(id) {
  const result = {};
  for(const shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if(urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;
};
const findUserEmail = (email, db) => {

  for (let userId in usersDb) {
    const user = usersDb[userId];
    if(user.email === email ) {
      return user;
    }
  }
  return null;
};

const isUsersLink = function (object, id) {
  let usersObject = {};
  for (let key in object) {
    if (object[key].userID === id) {
      usersObject[key] = object[key];
    }
  }
  return usersObject;
}

//res.render("urls_index", templateVars);

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });


//// Saving new URLs ////
/******OLD CODE*******/
// app.post("/urls", (req, res) => {
//   //console.log(urlDatabase);
//    const user_id = req.cookies['user_id'];
//    const user = usersDb[user_id];
//    if(!user) {
//      return res.redirect("/login");
//    }
//    const longURL = req.body.longURL;
//   const shortURL =  generateRandomString();
//   urlDatabase[shortURL] = {longURL , user_id } ;
  
//   res.redirect(`/urls/${shortURL}`);

// });
/****************NEW CODE*************/
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];

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
 /************************************/
 /*****GET New Url creation Page *****/
 app.get("/urls/new", (req, res) => {

  if(req.cookies['user_id']) {
   const user_id = req.cookies['user_id'];
   const templateVars = { urls: urlDatabase, user: usersDb[user_id] };
  // urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id'] } ;
   res.render("urls_new", templateVars);
   } else {
   // const templateVars = { urls: {}, user: ''};
   res.redirect('/login');
   }
 });
/************************************/


////////// displaying the webpage from the long URL ////////
app.get('/u/:shortURL', (req, res) => {
   const shortUrl = req.params.shortURL
   const longURL = urlDatabase[req.params.shortURL].longURL;
  if (shortURL) {
    res.redirect(longURL);
  } 
});
/////// Displaying Registration page////////
app.get('/register', (req, res) => {
  
  const templateVars =  {user: null}
  res.render('register', templateVars);
});
////////Displaying Users Database///
app.get("/users.json", (req, res) => {
  res.json(usersDb);
});
////////Register//////////////
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
const user = findUserEmail(email, usersDb);
 if(user) {
 return res.status(403).send('Sorry user already exists');
 
 } else if (email === "" || password === "") {
     return res.status(403).send('Please enter email and password');
     
    }
  const userId = generateRandomString();

  newUser = {
    id: userId,
    email,
    password
  }
   usersDb[userId] = newUser;
  res.cookie('user_id', userId);
  //console.log(userId);
  res.redirect('/urls');
});
/////////////Register Ends///////////////


//////Rendering Database/////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

///login get///
app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});

///login////
app.post("/login", (req, res) => {
  
  const useremail = req.body.email;
  const password = req.body.password;
  if (!useremail || !password) {
    console.log(useremail);
    return res.status(401).send("Please enter a valid email and password!");
   
  } else { 
  const user = findUserEmail(useremail, usersDb);

  if (user && user.password === password){
    //user is authenticated => log the user
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  } }
  // user is not authenticated
  return res.status(403).send('wrong credentials!');
  
});

//logout//
app.post("/logout", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id,
  };
  res.clearCookie('user_id');
  res.redirect('/urls');
});


/******  Private /url endpoints ********/
app.get("/urls", (req, res) => {
  //permissions
    const id = req.cookies['user_id'];
    const user = usersDb[id];
   if(!user) {
  //console.log(req.cookies['user_id']);
   return res.status(401).send("You must <a href='/login'>login</a> first. ");
   }
  //const user_id = req.cookies['user_id'];
  const urls = urlsForUserId(id);
  const templateVars = { urls, user };
  return res.render("urls_index", templateVars);
});


app.get("/urls", (req, res) => {
  // const shortURL = req.params.shortURL;
  const user_id = req.cookies['user_id'];
  const user = usersDb[user_id];
  if(!user_id || !user) {
    return res.status(401).send("You must <a href = '/login'>login </a> first. ");
  }
  const shortURL = req.params.shortURL;
  //console.log(userId);
  const url = urlDatabase[shortURL];
  // if (url.url_id !== user.id) {
  //   return res.status(401).send("You do not have access to this URL. Please <a href = '/login'>login </a> first. ");
  // }
  const templateVars = { shortURL , url , user};
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});
//*******Delete****** */
app.post("/urls/:shortURL/delete", (req, res) => {
const shortURL = req.params.shortURL;
const user_id = req.cookies['user_id'];
const url = urlDatabase[shortURL];
const user = usersDb[user_id];
if (user)
delete urlDatabase[shortURL]; 
res.redirect("/urls");

});
//*******GET Edit PAGE****** */
app.get("/urls/:shortURL", (req, res) => {
  //console.log("HHHOHAHHAHHHAHHHA");
   const shortURL = req.params.shortURL;
   const longURL = req.body.longURL;
  if(req.cookies['user_id']) {
    const userId = req.cookies['user_id'];
    const user_id = req.params.id;
 
    const templateVars = { urls: urlDatabase, user: usersDb[userId], shortURL, longURL: urlDatabase[shortURL].longURL};
    res.render("urls_show", templateVars);
    } else {
    // const templateVars = { urls: {}, user: ''};
    res.redirect('/urls');
    }
});
//*******Edit URL****** */
app.post("/urls/:shortURL", (req, res) => {
  //console.log("HHHOHAHHAHHHAHHHA");
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  let usersObj = isUsersLink(urlDatabase, userId);
    if(usersObj[shortURL]) {
      const longURL = req.body.longURL;
      urlDatabase[shortURL].longURL = longURL;

      res.redirect('/urls');
      } else {
      return  res.render("error", {ErrorStatus: 403, ErrorMessage: "You do not have access to edit this link."});
      }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});