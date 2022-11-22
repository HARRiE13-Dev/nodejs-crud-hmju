let express = require("express");
let router = express.Router();
let dbCon = require("../lib/Database.js");

// Display Data page
router.get("/", (req, res, next) => {
  dbCon.query("SELECT * FROM news ORDER BY ID desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("news", { data_news: "" });
    } else {
      res.render("news", { data_news: rows });
    }
  });
});

// display add book page
router.get("/add", (req, res, next) => {
  res.render("news/add", {
    Topic: "",
    Detail_1: "",
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let Topic = req.body.Topic;
  let Detail_1 = req.body.Detail_1;
  let errors = false;

  if (Topic.length === 0 || Detail_1.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("news/add", {
      Topic: Topic,
      Detail_1: Detail_1,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      Topic: Topic,
      Detail_1: Detail_1,
    };

    // insert query
    dbCon.query("INSERT INTO news SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("news/add", {
          Topic: form_data.Topic,
          Detail_1: form_data.Detail_1,
        });
      } else {
        req.flash("success", "Book successfully added");
        res.redirect("/news");
      }
    });
  }
});

module.exports = router;
