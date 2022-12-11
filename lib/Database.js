const { promise } = require("bcrypt/promises");
const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: "localhost", // MYSQL HOST NAME
  user: "root", // MYSQL USERNAME
  password: "", // MYSQL PASSWORD
  database: "nodejs_crud_db", // MYSQL DB NAME
});

// dbConnection.connect((error) => {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log("Connected. . . ");
//   }
// });

module.exports = dbConnection;
