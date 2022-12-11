var express = require("express");
var router = express.Router();
let dbCon = require("../lib/Database.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("shop", {
    title: "Express",

    product: "",
    quantity: 0,
    firstname: "",
    lastname: "",
    tel: "",
    address: "",
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

  // if (Topic.length === 0 || Detail_1.length === 0) {
  //   errors = true;
  //   // set flash message
  //   req.flash("error", "Please enter name and author");
  //   // render to add.ejs with flash message
  //   res.render("news/add", {
  //     Topic: Topic,
  //     Detail_1: Detail_1,
  //   });
  // }

  // // if no error
  // if (!errors) {
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
      res.render("shop", {
        product: form_data.product,
        quantity: form_data.quantity,
        firstname: form_data.firstname,
        lastname: form_data.lastname,
        tel: form_data.tel,
        address: form_data.address,
      });
    } else {
      req.flash("success", "Book successfully added");
      res.redirect("/");
    }
  });
  // }
});

module.exports = router;
