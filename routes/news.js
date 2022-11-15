let express = require("express");
let router = express.Router();
let dbCon = require("../lib/Database.js");

// Display Data page
router.get("/", (req, res, next) => {
  dbCon.query("SELECT * FROM news ORDER BY ID desc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("news", { data: '' });
    } else {
      res.render("news", { data: rows });
    }
  });
});
module.exports = router;
