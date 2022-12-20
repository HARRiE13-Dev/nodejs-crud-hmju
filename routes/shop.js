var express = require("express");
var router = express.Router();
let dbCon = require("../lib/Database.js");

/* GET home page. */
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

router.get("/", function (req, res, next) {
  dbCon.query("SELECT * FROM shops ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("shop", {
        product: "",
        quantity: 0,
        firstname: "",
        lastname: "",
        tel: "",
        address: "",
        name: "",
      });
    } else {
      res.render("shop", {
        data: rows,
        product: "",
        quantity: 0,
        firstname: "",
        lastname: "",
        tel: "",
        address: "",
        
      });
    }
  });
  // res.render("shop", {
  //   title: "Express",

  //   product: "",
  //   quantity: 0,
  //   firstname: "",
  //   lastname: "",
  //   tel: "",
  //   address: "",
  // });
});

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM shops ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("shop/show", { data: "" });
    } else {
      res.render("shop/show", { data: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("shop/add", {
    name: "",
    price: "",
    image: "",
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let name = req.body.name;
  let price = req.body.price;
  let image = req.body.image;
  let errors = false;

  if (name.length === 0 || price.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("shop/add", {
      name: name,
      price: price,
      image: image,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      name: name,
      price: price,
      image: image,
    };

    // insert query
    dbCon.query("INSERT INTO shops SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.render("shop/add", {
          name: form_data.name,
          price: form_data.price,
          image: form_data.image,
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

  dbCon.query("SELECT * FROM shops WHERE id = " + id, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "News not found with id = " + id);
      res.redirect("/show");
    } else {
      res.render("shop/edit", {
        title: "Edit shop",
        id: rows[0].id,
        name: rows[0].name,
        price: rows[0].price,
        image: rows[0].image,
      });
    }
  });
});

// update book page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let name = req.body.name;
  let price = req.body.price;
  let image = req.body.image;
  let errors = false;

  if (name.length === 0 || price.length === 0) {
    errors = true;
    req.flash("error", "Please enter data");
    res.render("shop/edit", {
      id: req.params.id,
      name: name,
      price: price,
      image: image,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      name: name,
      price: price,
      image: image,
    };
    // update query
    dbCon.query(
      "UPDATE shops SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("shop/edit", {
            id: req.params.id,
            name: form_data.name,
            price: form_data.price,
            image: form_data.image,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/shop/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM shops WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/shop/show");
    } else {
      req.flash("success", "News successfully deleted! id = " + id);
      res.redirect("/shop/show");
    }
  });
});

router.post("/", (req, res, next) => {
  let product = req.body.product;
  let quantity = req.body.quantity;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let tel = req.body.tel;
  let address = req.body.address;

  let errors = false;

  if (
    firstname.length === 0 ||
    lastname.length === 0 ||
    tel.length === 0 ||
    address.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and info");
    // render to add.ejs with flash message
    res.render("shop", {
      product: product,
      quantity: quantity,
      firstname: firstname,
      lastname: lastname,
      tel: tel,
      address: address,
    });
  }

  // // if no error
  if (!errors) {
    let form_data = {
      product: product,
      quantity: quantity,
      firstname: firstname,
      lastname: lastname,
      tel: tel,
      address: address,
    };

    // insert query
    dbCon.query("INSERT INTO orders SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);
        res.redirect("shop");
        res.render("shop", {
          product: form_data.product,
          quantity: form_data.quantity,
          firstname: form_data.firstname,
          lastname: form_data.lastname,
          tel: form_data.tel,
          address: form_data.address,
        });
      } else {
        req.flash("success", "บันทึกข้อมูลสำเร็จ");
        res.redirect("order");
      }
    });
  }
});

module.exports = router;
