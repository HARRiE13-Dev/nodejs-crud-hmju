const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const dbConnection = require("./lib/Database");
const { body, validationResult } = require("express-validator");
const { log } = require("debug");
const { flatten } = require("express/lib/utils");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const flash = require("express-flash");
const session = require("express-session");

var usersRouter = require("./routes/users");

const indexRouter = require("./routes/index");
const aboutRouter = require("./routes/about");
const contentRouter = require("./routes/content");
const organizeRouter = require("./routes/organize");
const shopRouter = require("./routes/shop");
const contactRouter = require("./routes/contact");
const calendarRouter = require("./routes/calendar");
const newsRouter = require("./routes/news");
var adminRouter = require("./routes/admin");

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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(flash());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/news", newsRouter);
app.use("/news/show", newsRouter);

app.use("/about", aboutRouter);
app.use("/content", contentRouter);
app.use("/organize", organizeRouter);
app.use("/shop", shopRouter);
app.use("/contact", contactRouter);
app.use("/calendar", calendarRouter);

app.use(express.static("img"));
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("scss"));
app.use(express.static("lib"));
app.use(express.static("vender"));

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("login-register");
  }
  next();
};
const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
// END OF CUSTOM MIDDLEWARE
// ROOT PAGE
app.get("/login", ifNotLoggedin, (req, res, next) => {
  dbConnection.query(
    "SELECT `name` FROM `users` WHERE `id`=?",
    [req.session.userID],
    async function (err, rows, fields) {
      res.render("admin", {
        name: rows[0].name,
      });
    }
  );
});

// END OF ROOT PAGE

// REGISTER PAGE
app.post(
  "/register",
  ifLoggedin,
  // post data validation(using express-validator)
  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return dbConnection.query(
          "SELECT `email` FROM `users` WHERE `email`=?",
          [value],
          async function (err, results, fields) {
            if (results.length > 0) {
              return Promise.reject("This E-mail already in use!");
            }
            return true;
          }
        );
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
      bcrypt.hash(user_pass, 12).then(async (hash_pass) => {
        // INSERTING USER INTO DATABASE
        await dbConnection.query(
          "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
          [user_name, user_email, hash_pass],
          async function (err, results, fields) {
            if (!err) {
              res.send(
                `your account has been created successfully, Now you can <a href="/">Login</a>`
              );
            } else {
              if (err) throw err;
            }
            return true;
          }
        );
      });
    } else {
      // COLLECT ALL THE VALIDATION ERRORS
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      // REDERING login-register PAGE WITH VALIDATION ERRORS
      res.render("login-register", {
        register_error: allErrors,
        old_data: req.body,
      });
    }
  }
); // END OF REGISTER PAGE

// LOGIN PAGE
app.post(
  "/login",
  ifLoggedin,
  [
    body("user_email").custom((value) => {
      return dbConnection.query(
        "SELECT email FROM users WHERE email=?",
        [value],
        async function (err, rows, fields) {
          if (rows.length == 1) {
            return true;
          }
          return Promise.reject("Invalid Email Address!");
        }
      );
    }),
    body("user_pass", "Password is empty!").trim().not().isEmpty(),
  ],
  (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
      dbConnection.query(
        "SELECT * FROM `users` WHERE `email`=?",
        [user_email],
        async function (err, rows, fields) {
          bcrypt
            .compare(user_pass, rows[0].password)
            .then((compare_result) => {
              if (compare_result === true) {
                req.session.isLoggedIn = true;
                req.session.userID = rows[0].id;

                res.redirect("/login");
              } else {
                res.render("login-register", {
                  login_errors: ["Invalid Password!"],
                });
              }
            })
            .catch((err) => {
              if (err) throw err;
            });
        }
      );
    } else {
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      // REDERING login-register PAGE WITH LOGIN VALIDATION ERRORS
      res.render("login-register", {
        login_errors: allErrors,
      });
    }
  }
);
// END OF LOGIN PAGE

// LOGOUT
app.get("/logout", (req, res) => {
  //session destroy
  req.session = null;
  res.redirect("/");
});
// END OF LOGOUT

app.use("/", (req, res) => {
  res.status(404).render("error", { title: "Express" });
});

app.listen(() => console.log("Server is Running..."));

module.exports = app;
