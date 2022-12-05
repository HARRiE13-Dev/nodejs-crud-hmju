let express = require("express");
let path = require("path");
let cookieSession = require("cookie-session");
let bcrypt = require("bcrypt");
let dbConnection = require("../lib/Database.js");
let { body, validationResult } = require("express-validator");

let router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("calendar", { title: "Express" });
});

module.exports = router;
