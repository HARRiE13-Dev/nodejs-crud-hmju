const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const dbConnection = require("../lib/Database");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.urlencoded({ extended: false }));

// SET OUR VIEWS AND VIEW ENGINE
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// APPLY COOKIE SESSION MIDDLEWARE
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 3600 * 1000, // 1hr
  })
);

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("register", { title: "Express" });
  }
  next();
};
const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render("", { title: "Express" });
  }
  next();
};
// END OF CUSTOM MIDDLEWARE
// ROOT PAGE
app.get("/register", ifNotLoggedin, (req, res, next) => {
  dbConnection
    .execute("SELECT `name` FROM `users` WHERE `id`=?", [req.session.userID])
    .then(([rows]) => {
      res.render("register", {
        name: rows[0].name,
      });
    });
}); // END OF ROOT PAGE

// REGISTER PAGE
app.post(
  "/register",
  ifLoggedin,
  // post data validation(using express-validator)
  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return dbConnection
          .execute("SELECT `email` FROM `users` WHERE `email`=?", [value])
          .then(([rows]) => {
            if (rows.length > 0) {
              return Promise.reject("This E-mail already in use!");
            }
            return true;
          });
      }),
    body("user_name", "Username is Empty!").trim().not().isEmpty(),
    body("user_pass", "The password must be of minimum length 6 characters")
      .trim()
      .isLength({ min: 6 }),
  ], // end of post data validation
  (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email } = req.body;
    // IF validation_result HAS NO ERROR
    if (validation_result.isEmpty()) {
      // password encryption (using bcryptjs)
      bcrypt
        .hash(user_pass, 12)
        .then((hash_pass) => {
          // INSERTING USER INTO DATABASE
          dbConnection
            .execute(
              "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
              [user_name, user_email, hash_pass]
            )
            .then((result) => {
              res.send(
                `your account has been created successfully, Now you can <a href="/">Login</a>`
              );
            })
            .catch((err) => {
              // THROW INSERTING USER ERROR'S
              if (err) throw err;
            });
        })
        .catch((err) => {
          // THROW HASING ERROR'S
          if (err) throw err;
        });
    } else {
      // COLLECT ALL THE VALIDATION ERRORS
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      // REDERING login-register PAGE WITH VALIDATION ERRORS
      res.render("register", {
        register_error: allErrors,
        old_data: req.body,
      });
    }
  }
); // END OF REGISTER PAGE


app.listen(() => console.log("Server is Running..."));

/* GET home page. */
let router = express.Router();

router.get("/", function (req, res, next) {
  res.render("register", { title: "Express" });
  // res.redirect('/register')
});

module.exports = router;
