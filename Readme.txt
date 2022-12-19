<!-- Messenger Chat Plugin Code -->
    <div id="fb-root"></div>

    <!-- Your Chat Plugin code -->
    <div id="fb-customer-chat" class="fb-customerchat">
    </div>

    <script>
      var chatbox = document.getElementById('fb-customer-chat');
      chatbox.setAttribute("page_id", "115756247986794");
      chatbox.setAttribute("attribution", "biz_inbox");
    </script>

    <!-- Your SDK code -->
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          xfbml            : true,
          version          : 'v15.0'
        });
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    </script>

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// Page Input
var newsRouter = require("./routes/news");
var aboutRouter = require("./routes/about");
var contentRouter = require("./routes/content");
var organizeRouter = require("./routes/organize");
var shopRouter = require("./routes/shop");
var contactRouter = require("./routes/contact");
var calendarRouter = require("./routes/calendar");
var loginRouter = require("./routes/login");
var registerRouter = require("./routes/register");
var adminRouter = require("./routes/admin");

const { application } = require("express");
var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
//Path website
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/news", newsRouter);
app.use("/about", aboutRouter);
app.use("/login", loginRouter);
app.use("/content", contentRouter);
app.use("/organize", organizeRouter);
app.use("/shop", shopRouter);
app.use("/contact", contactRouter);
app.use("/calendar", calendarRouter);
app.use("/register", registerRouter);

//Admin routes
app.use("/admin", adminRouter);
app.use("/admin/test", adminRouter);

// import File
app.use(express.static("img"));
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("scss"));
app.use(express.static("lib"));
app.use(express.static("vender"));

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

