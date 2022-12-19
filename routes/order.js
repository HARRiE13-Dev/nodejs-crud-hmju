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
  dbCon.query("SELECT * FROM orders ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("order", { data: "" });
    } else {
      res.render("order", { data: rows });
    }
  });
});

router.get("/show", ifNotLoggedin, (req, res, next) => {
  dbCon.query("SELECT * FROM orders ORDER BY id desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("order/show", { data: "" });
    } else {
      res.render("order/show", { data: rows });
    }
  });
});

// display add book page
router.get("/add", ifNotLoggedin, (req, res, next) => {
  res.render("order/add", {
    product: "",
    quantity: 0,
    firstname: "",
    lastname: "",
    tel: "",
    address: "",
    order_status: "",
    track_id: "",
    price: 0,
    total: 0,
  });
});

// add a new book
router.post("/add", (req, res, next) => {
  let product = req.body.product;
  let quantity = req.body.quantity;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let tel = req.body.tel;
  let address = req.body.address;
  let order_status = req.body.order_status;
  let track_id = req.body.track_id;
  let price = req.body.price;
  let total = req.body.price * req.body.quantity;

  let errors = false;

  if (
    product.length === 0 ||
    quantity.length === 0 ||
    firstname.length === 0 ||
    address.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name and author");
    // render to add.ejs with flash message
    res.render("order/add", {
      product: product,
      quantity: quantity,
      firstname: firstname,
      lastname: lastname,
      tel: tel,
      address: address,
      order_status: order_status,
      track_id: track_id,
      price: price,
      total: total,
    });
  }

  // // if no error
  // if (!errors) {
  let form_data = {
    product: product,
    quantity: quantity,
    firstname: firstname,
    lastname: lastname,
    tel: tel,
    address: address,
    order_status: order_status,
    track_id: track_id,
    price: price,
    total: total,
  };

  // insert query
  dbCon.query("INSERT INTO orders SET ?", form_data, (err, result) => {
    if (err) {
      req.flash("error", err);
      res.render("order/add", {
        product: form_data.product,
        quantity: form_data.quantity,
        firstname: form_data.firstname,
        lastname: form_data.lastname,
        tel: form_data.tel,
        address: form_data.address,
        order_status: form_data.order_status,
        track_id: form_data.track_id,
        price: form_data.price,
        total: total,
      });
    } else {
      req.flash("success", "Book successfully added");
      res.redirect("show");
    }
  });
  // }
});

// display edit book page
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("SELECT * FROM orders WHERE id = " + id, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "Data not found with id = " + id);
      res.redirect("/show");
    } else {
      res.render("order/edit", {
        title: "Edit order",
        id: rows[0].id,
        product: rows[0].product,
        quantity: rows[0].quantity,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        tel: rows[0].tel,
        address: rows[0].address,
        order_status: rows[0].order_status,
        track_id: rows[0].track_id,
        price: rows[0].price,
        total: rows[0].total,
      });
    }
  });
});

// update book page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let product = req.body.product;
  let quantity = req.body.quantity;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let tel = req.body.tel;
  let address = req.body.address;
  let order_status = req.body.order_status;
  let track_id = req.body.track_id;
  let price = req.body.price;
  let total = req.body.price * req.body.quantity;
  let errors = false;

  if (
    product.length === 0 ||
    quantity.length === 0 ||
    firstname.length === 0 ||
    address.length === 0
  ) {
    errors = true;
    req.flash("error", "Please enter data");
    res.render("order/edit", {
      id: req.params.id,
      product: product,
      quantity: quantity,
      firstname: firstname,
      lastname: lastname,
      tel: tel,
      address: address,
      order_status: order_status,
      track_id: track_id,
      price: price,
      total: total,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      product: product,
      quantity: quantity,
      firstname: firstname,
      lastname: lastname,
      tel: tel,
      address: address,
      order_status: order_status,
      track_id: track_id,
      price: price,
      total: total,
    };
    // update query
    dbCon.query(
      "UPDATE orders SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("order/edit", {
            id: req.params.id,
            product: form_data.product,
            quantity: form_data.quantity,
            firstname: form_data.firstname,
            lastname: form_data.lastname,
            tel: form_data.tel,
            address: form_data.address,
            order_status: form_data.order_status,
            track_id: form_data.track_id,
            price: form_data.price,
            total: total,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/order/show");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM orders WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/order/show");
    } else {
      req.flash("success", "News successfully deleted! id = " + id);
      res.redirect("/order/show");
    }
  });
});

module.exports = router;
