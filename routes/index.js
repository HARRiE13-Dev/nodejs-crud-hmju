let express = require("express");
let path = require("path");
let cookieSession = require("cookie-session");
let bcrypt = require("bcrypt");
let dbConnection = require("../lib/Database.js");
let { body, validationResult } = require("express-validator");

let router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/service", function (req, res, next) {
  res.render("service", { title: "Express" });
});




//--------------------------------Login----------------------------------------------

// ROOT PAGE
const ifNotLoggedin = (req, res, next) => {
  if(!req.session.isLoggedIn){
      return res.render('login');
  }
  next();
}
const ifLoggedin = (req,res,next) => {
  if(req.session.isLoggedIn){
      return res.redirect('service');
  }
  next();
}

router.get("/login", ifNotLoggedin, (req, res, next) => {
  dbConnection
    .execute("SELECT `username` FROM `users` WHERE `id`=?", [req.session.userID])
    .then(([rows]) => {
      res.render("service", {
        username: rows[0].username,
      });
    });
}); 

router.post('/login/register', ifLoggedin, 
// post data validation(using express-validator)
[
    body('user_email','Invalid email address!').isEmail().custom((value) => {
        return dbConnection.execute('SELECT `email` FROM `users` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length > 0){
                return Promise.reject('This E-mail already in use!');
            }
            return true;
        });
    }),
    body('user_name','Username is Empty!').trim().not().isEmpty(),
    body('user_pass','The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
],// end of post data validation
(req,res,next) => {

  const validation_result = validationResult(req);
  const {user_name, user_pass, user_email} = req.body;
  // IF validation_result HAS NO ERROR
  if(validation_result.isEmpty()){
      // password encryption (using bcryptjs)
      bcrypt.hash(user_pass, 12).then((hash_pass) => {
          // INSERTING USER INTO DATABASE
          dbConnection.execute("INSERT INTO `users`(`username`,`email`,`password`) VALUES(?,?,?)",[user_name,user_email, hash_pass])
          .then(result => {
              res.send(`your account has been created successfully, Now you can <a href="/">Login</a>`);
          }).catch(err => {
              // THROW INSERTING USER ERROR'S
              if (err) throw err;
          });
      })
      .catch(err => {
          // THROW HASING ERROR'S
          if (err) throw err;
      })
  }
  else{
      // COLLECT ALL THE VALIDATION ERRORS
      let allErrors = validation_result.errors.map((error) => {
          return error.msg;
      });
      // REDERING login-register PAGE WITH VALIDATION ERRORS
      res.render('login',{
          register_error:allErrors,
          old_data:req.body
      });
  }
});// END OF REGISTER PAGE

module.exports = router;
