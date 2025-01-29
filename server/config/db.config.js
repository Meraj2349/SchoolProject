import mysql from "mysql2/promise"; //use for async/await

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "School_Management",
});

console.log("connected to MySQL database");

export default db;
