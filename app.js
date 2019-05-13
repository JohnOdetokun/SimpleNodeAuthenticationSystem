const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/zaioUserDb", {useNewUrlParser: true});


const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String
  }
);

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.post("/signup", function(req, res){
  const newUser =  new User({
    username: req.body.username,
    email: req.body.email,
    password: md5(req.body.password)
  });

  User.findOne({username: newUser.username}, function(err, foundUser){
    if (!err) {
      if (foundUser) {
        if (foundUser.password === newUser.password) {
          res.render("success");
        }
      }
    }
  });

  newUser.save(function(err){
    if (err) {
      res.render("failure");
    } else {
      res.render("success");
    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({username: username}, function(err, foundUser){
    if (err) {
      res.render("failure");
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("success");
        }
      }
    }
  });
});

app.get("/logout", function(req, res){
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
