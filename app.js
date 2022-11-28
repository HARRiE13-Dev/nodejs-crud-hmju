var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

//Extention for use data
let flash = require("express-flash");
let session = require("express-session");
let mysql = require("mysql");
let connection = require("./lib/Database");
let cookieSession = require("cookie-session");
let bcrypt = require("bcrypt");
let { body, validationResult } = require("express-validator");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// Page Input
var newsRouter = require("./routes/news");
var aboutRouter = require("./routes/about");
var contentRouter = require("./routes/content");
var organizeRouter = require("./routes/organize");
var shopRouter = require("./routes/shop");
var contactRouter = require("./routes/contact");
const { application } = require("express");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Login
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 3600 * 1000, // 1hr
  })
);

// DECLARING CUSTOM MIDDLEWARE
// const ifNotLoggedin = (req, res, next) => {
//   if(!req.session.isLoggedIn){
//       return res.render('login');
//   }
//   next();
// }

// END OF CUSTOM MIDDLEWARE

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Call to use extention
app.use(
  session({
    cookie: { maxAge: 6000 },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: "true",
    secret: "secret",
  })
);

app.use(flash());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/news", newsRouter);
app.use("/about", aboutRouter);
app.use("/service", aboutRouter);
app.use("/login", indexRouter);
app.use("/content", contentRouter);
app.use("/organize", organizeRouter);
app.use("/shop", shopRouter);
app.use("/contact", contactRouter);

// import File
app.use(express.static("img"));
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("scss"));
app.use(express.static("lib"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
