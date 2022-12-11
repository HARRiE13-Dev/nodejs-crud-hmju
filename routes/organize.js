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
  dbCon.query("SELECT * FROM staffs ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("organize", { data_staffs: "" });
    } else {
      res.render("organize", { data_staffs: rows });
    }
  });
});

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM staffs ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("organize/show", { data_staffs: "" });
    } else {
      res.render("organize/show", { data_staffs: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("organize/add", {
    firstname: "",
    lastname: "",
    position: "",
    info: "",
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let position = req.body.position;
  let info = req.body.info;
  let errors = false;

  if (
    firstname.length === 0 ||
    lastname.length === 0 ||
    position.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter data");
    // render to add.ejs with flash message
    res.render("organize/add", {
      firstname: firstname,
      lastname: lastname,
      position: position,
      info: info,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      firstname: firstname,
      lastname: lastname,
      position: position,
      info: info,
    };

    // insert query
    dbCon.query("INSERT INTO staffs SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("organize/add", {
          Topic: form_data.Topic,
          Detail_1: form_data.Detail_1,
        });
      } else {
        req.flash("success", "Successfully added");
        res.redirect("show");
      }
    });
  }
});

// display edit book page
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("SELECT * FROM staffs WHERE id = " + id, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "Not found with id = " + id);
      res.redirect("/show");
    } else {
      res.render("organize/edit", {
        id: rows[0].id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        position: rows[0].position,
        info: rows[0].info,
      });
    }
  });
});

// update book page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let position = req.body.position;
  let info = req.body.info;
  let errors = false;

  if (
    firstname.length === 0 ||
    lastname.length === 0 ||
    position.length === 0
  ) {
    errors = true;
    req.flash("error", "Please enter Data");
    res.render("organize/edit", {
      id: req.params.id,
      firstname: firstname,
      firstname: firstname,
      position: position,
      info: info,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      firstname: firstname,
      lastname: lastname,
      position: position,
      info: info,
    };
    // update query
    dbCon.query(
      "UPDATE staffs SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("organize/edit", {
            id: req.params.id,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            position: req.body.position,
            info: req.body.info,
          });
        } else {
          req.flash("success", "Successfully updated");
          res.redirect("/organize/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM staffs WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/organize/show");
    } else {
      req.flash("success", "Successfully deleted! id = " + id);
      res.redirect("/organize/show");
    }
  });
});

module.exports = router;
