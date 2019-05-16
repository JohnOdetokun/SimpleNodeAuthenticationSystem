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

mongoose.connect("mongodb://localhost:27017/zaioUserDb", {useNewUrlParser: true,
useFindAndModify: false});


const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    profile: {
      name: String,
      lastName: String,
      age: Number,
      degree: String,
      favouriteCourse: String
    }
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
    password: md5(req.body.password),
    profile: {
      name: "",
      lastName: "",
      age: null,
      degree: "",
      favouriteCourse: ""
    }
  });

  User.findOne({username: newUser.username}, function(err, foundUser){
    if (!err) {
      if (foundUser) {
        res.render("failure", {
          message: "User with this username already exists!"
        });
      }
    }
  });

  newUser.save(function(err){
    if (err) {
      res.render("failure", {
        message: "Something went wrong with your signup. Please try again."
      });
    } else {

      User.findOne({username: newUser.username}, function(err, foundUser){
        if (!err) {
          if (foundUser) {
            res.render("success", {
              userid: foundUser._id
            });
          }
        }
      });

    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({username: username}, function(err, foundUser){
    if (err) {
      res.render("failure", {
        message: "User with this username does not exist!"
      });
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("success", {
            userid: foundUser._id
          });
        }
        else
        {
          res.render("failure", {
            message: "Incorrect password!"
          });
        }
      }
    }
  });
});

app.get("/logout", function(req, res){
  res.redirect("/");
});

app.get("/profile/:userid", function(req, res){
  const userId = req.params.userid;


  User.findOne({_id: userId}, function(err, foundUser){
    if(!err){
      res.render("viewProfile", {
        userId: userId,
        profile: foundUser.profile,
        message: ""
      });
    } else {
      res.render("/");
    }
  });
});

app.post("/profile/:userid", function(req, res){
  const userId = req.params.userid;
  const profileInfo = {
    name: req.body.firstname,
    lastName: req.body.lastname,
    age: req.body.age,
    degree: req.body.degree,
    favouriteCourse: req.body.favcourse
  };
  const newValues = { $set: {profile: profileInfo}};
  User.findByIdAndUpdate(
    userId,
    newValues,
    {new: true},
    function(err, updatedUser) {
      if(!err){
        console.log(updatedUser.profile);
        res.render("viewProfile", {
          userId: userId,
          profile: updatedUser.profile,
          message: "Save Successfull!"
        });
      }
      else{
        res.render("viewProfile", {
          userId: userId,
          message: "Save Failed!"
        });
      }
    }
   );
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
