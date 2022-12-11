let express = require("express");
let path = require("path");
let cookieSession = require("cookie-session");
let bcrypt = require("bcrypt");
let dbConnection = require("../lib/Database.js");
let { body, validationResult } = require("express-validator");

let router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("admin", { title: "Express" });
});




router.get("/test", function (req, res, next) {
  res.render("admin/news", { title: "Express" });
});

router.get("/crud", (req, res, next) => {
  dbCon.query("SELECT * FROM news ORDER BY ID desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("news/index_crud", { data_news: "" });
    } else {
      res.render("news/index_crud", { data_news: rows });
    }
  });
});
module.exports = router;
