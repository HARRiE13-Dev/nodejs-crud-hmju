var express = require("express");
var router = express.Router();
let dbCon = require("../lib/Database.js");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("content", { title: "Express" });
});

const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM contents ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("content/show", { data: "" });
    } else {
      res.render("content/show", { data: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("content/add", {
    topic: "",
    detail_1: "",
    detail_2: "",
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let topic = req.body.topic;
  let detail_1 = req.body.detail_1;
  let detail_2 = req.body.detail_2;
  let errors = false;

  if (topic.length === 0 || detail_1.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("content/add", {
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    };

    // insert query
    dbCon.query("INSERT INTO contents SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("content/add", {
          topic: form_data.topic,
          detail_1: form_data.detail_1,
          detail_2: form_data.detail_2,
        });
      } else {
        req.flash("success", "Book successfully added");
        res.redirect("show");
      }
    });
  }
});

// display edit book page
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query(
    "SELECT * FROM contents WHERE id = " + id,
    (err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "News not found with id = " + id);
        res.redirect("/show");
      } else {
        res.render("content/edit", {
          title: "Edit content",
          id: rows[0].id,
          topic: rows[0].topic,
          detail_1: rows[0].detail_1,
          detail_2: rows[0].detail_2,
        });
      }
    }
  );
});

// update book page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let topic = req.body.topic;
  let detail_1 = req.body.detail_1;
  let detail_2 = req.body.detail_2;
  let errors = false;

  if (topic.length === 0 || detail_1.length === 0) {
    errors = true;
    req.flash("error", "Please enter data");
    res.render("content/edit", {
      id: req.params.id,
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    };
    // update query
    dbCon.query(
      "UPDATE contents SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("content/edit", {
            id: req.params.id,
            topic: form_data.topic,
            detail_1: form_data.detail_1,
            detail_2: form_data.detail_2,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/content/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM contents WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/content/show");
    } else {
      req.flash("success", "News successfully deleted! id = " + id);
      res.redirect("/content/show");
    }
  });
});

module.exports = router;
