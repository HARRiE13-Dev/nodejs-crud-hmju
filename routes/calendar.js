let express = require("express");
let router = express.Router();
let dbCon = require("../lib/Database.js");

const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
// Display Data page
router.get("/", function (req, res, next) {
  dbCon.query("SELECT * FROM calendars ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("calendar", { data: "" });
    } else {
      res.render("calendar", { data: rows });
    }
  });
});

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM calendars ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("calendar/show", { data: "" });
    } else {
      res.render("calendar/show", { data: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("calendar/add", {
    location: "",
    date_: "",
    time_: "",
    topic: "",
    detail_1: "",
    detail_2: "",
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let location = req.body.location;
  let date_ = req.body.date_;
  let time_ = req.body.time_;
  let topic = req.body.topic;
  let detail_1 = req.body.detail_1;
  let detail_2 = req.body.detail_2;
  let errors = false;

  if (
    topic.length === 0 ||
    detail_1.length === 0 ||
    date_.length === 0 ||
    time_.length === 0 ||
    location.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("calendar/add", {
      location: location,
      date_: date_,
      time_: time_,
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      location: location,
      date_: date_,
      time_: time_,
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    };

    // insert query
    dbCon.query("INSERT INTO calendars SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("calendar/add", {
          location: form_data.location,
          date_: form_data.date_,
          time_: form_data.time_,
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
    "SELECT * FROM calendars WHERE id = " + id,
    (err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "News not found with id = " + id);
        res.redirect("/show");
      } else {
        res.render("calendar/edit", {
          title: "Edit calendar",
          id: rows[0].id,
          location: rows[0].location,
          date_: rows[0].date_,
          time_: rows[0].time_,
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
  let location = req.body.location;
  let date_ = req.body.date_;
  let time_ = req.body.time_;
  let topic = req.body.topic;
  let detail_1 = req.body.detail_1;
  let detail_2 = req.body.detail_2;
  let errors = false;

  if (
    topic.length === 0 ||
    detail_1.length === 0 ||
    date_.length === 0 ||
    time_.length === 0 ||
    location.length === 0
  ) {
    errors = true;
    req.flash("error", "Please enter data");
    res.render("calendar/edit", {
      id: req.params.id,
      location: location,
      date_: date_,
      time_: time_,
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      location: location,
      date_: date_,
      time_: time_,
      topic: topic,
      detail_1: detail_1,
      detail_2: detail_2,
    };
    // update query
    dbCon.query(
      "UPDATE calendars SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("calendar/edit", {
            id: req.params.id,
            location: form_data.location,
            date_: form_data.date_,
            time_: form_data.time_,
            topic: form_data.topic,
            detail_1: form_data.detail_1,
            detail_2: form_data.detail_2,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/calendar/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM calendars WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/calendar/show");
    } else {
      req.flash("success", "News successfully deleted! id = " + id);
      res.redirect("/calendar/show");
    }
  });
});

module.exports = router;
