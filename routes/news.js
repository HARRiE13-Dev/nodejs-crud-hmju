let express = require("express");
let router = express.Router();
let dbCon = require("../lib/Database.js");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const upload = multer({ dest: "uploads/" });

const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
// Display Data page
router.get("/", function (req, res, next) {
  dbCon.query("SELECT * FROM news ORDER BY ID desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("news", { data_news: "" });
    } else {
      res.render("news", { data_news: rows });
    }
  });
});

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM news ORDER BY ID desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("news/show", { data_news: "" });
    } else {
      res.render("news/show", { data_news: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("news/add", {
    Topic: "",
    Detail_1: "",
    image: null,
  });
});

var storage = multer.diskStorage({
  destination: (req, files,cb) => {
    cb(null, "Images");
  },
  filename: (req, files, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// add a new book
router.post("/add", upload.single("image"), (req, res, next) => {
  let Topic = req.body.Topic;
  let Detail_1 = req.body.Detail_1;
  let file = req.body.image;
  let imageData = fs.readFileSync(file.path);
  let imageType = file.mimetype;
  let errors = false;

  if (Topic.length === 0 || Detail_1.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter Data");
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
      file: [file.originalname, imageData],
    };

    // insert query
    dbCon.query("INSERT INTO news SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("news/add", {
          Topic: form_data.Topic,
          Detail_1: form_data.Detail_1,
          Picture: form_data.file,
        });
      } else {
        req.flash("success", "Successfully added");
        res.redirect("show");
      }
    });
  }
});

// display edit book page
router.get("/edit/(:ID)", (req, res, next) => {
  let ID = req.params.ID;

  dbCon.query("SELECT * FROM news WHERE ID = " + ID, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "Not found with ID = " + ID);
      res.redirect("/show");
    } else {
      res.render("news/edit", {
        title: "Edit news",
        ID: rows[0].ID,
        Topic: rows[0].Topic,
        Detail_1: rows[0].Detail_1,
      });
    }
  });
});

// update book page
router.post("/update/:ID", (req, res, next) => {
  let ID = req.params.ID;
  let Topic = req.body.Topic;
  let Detail_1 = req.body.Detail_1;
  let errors = false;

  if (Topic.length === 0 || Detail_1.length === 0) {
    errors = true;
    req.flash("error", "Please enter Data");
    res.render("news/edit", {
      ID: req.params.ID,
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
    // update query
    dbCon.query(
      "UPDATE news SET ? WHERE ID = " + ID,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("news/edit", {
            ID: req.params.ID,
            Topic: form_data.Topic,
            Detail_1: form_data.Detail_1,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/news/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:ID)", (req, res, next) => {
  let id = req.params.ID;

  dbCon.query("DELETE FROM news WHERE ID = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/news/show");
    } else {
      req.flash("success", "Successfully deleted! ID = " + id);
      res.redirect("/news/show");
    }
  });
});

module.exports = router;
