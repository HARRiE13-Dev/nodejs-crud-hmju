const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const dbConnection = require("../lib/Database");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 3600 * 1000, // 1hr
  })
);

const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("login");
  }
  next();
};

const ifLoggedin = (req,res,next) => {
  if(req.session.isLoggedIn){
      return res.redirect('/admin');
  }
  next();
}

app.get("/", ifNotLoggedin, (req, res, next) => {
  dbConnection
    .execute("SELECT `username` FROM `users` WHERE `id`=?", [
      req.session.userID,
    ])
    .then(([rows]) => {
      res.render("/", {
        name: rows[0].name,
      });
    });
}); //

let router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Express" });
});

module.exports = router;
