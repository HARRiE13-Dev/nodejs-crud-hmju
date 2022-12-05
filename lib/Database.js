// const { promise } = require("bcrypt/promises");
// let mysql = require("mysql");
// // let connection = mysql.createConnection({
// let dbConnection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "nodejs_crud_db",
// });
// dbConnection.connect((error) => {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log("Connected...");
//   }
// })
// module.exports = dbConnection;

const { promise } = require("bcrypt/promises");
const mysql = require("mysql");
const dbConnection = mysql.createConnection({
  host: "localhost", // MYSQL HOST NAME
  user: "root", // MYSQL USERNAME
  password: "", // MYSQL PASSWORD
  database: "nodejs_crud_db", // MYSQL DB NAME
});

module.exports = dbConnection;
