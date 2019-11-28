const express = require("express");
var mysql = require("mysql");
const UUID = require("uuid");
const JWT = require("jsonwebtoken");
// var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha512");

var connection = mysql.createConnection({
  host: "localhost",
  user: "faisal",
  password: "testing123",
  database: "hacktiv8_test1"
});

connection.connect();

const router = express.Router();



router.get("/count-users", async (req, res) => {
  connection.query("SELECT * from users", function(error, results, fields) {
    if (error) throw error;
    // console.log('The solution is: ', results[0].solution);
    res.json({
      data: results.length
    });
  });
});

router.get("/users", async (req, res) => {

  console.log(req.query)

  var numRows;
  var queryPagination;
  var numPerPage = parseInt(req.query.npp, 10) || 1;
  var page = parseInt(req.query.page - 1, 10) || 0;
  var numPages;
  var skip = page * numPerPage;
  // Here we compute the LIMIT parameter for MySQL query


  var limit = skip + ',' + numPerPage;
  console.log('limit', limit)

  connection.query(`SELECT * from users LIMIT ${limit}`  , function(error, results, fields) {
    if (error) throw error;
    // console.log('The solution is: ', results[0].solution);
  
    res.json({
      users: results
    });
  
});

router.get("/user", async (req, res) => {
  console.log(req.query.id);
  if (req.query.id == null) {
    return res.sendStatus(403);
  }
  connection.query("SELECT * FROM users INNER JOIN detail_user ON users.id = detail_user.id where users.id = ?", [req.query.id], function(
    error,
    results,
    fields
  ) {
    if (error) throw error;
    // console.log('The solution is: ', results[0].solution);
    res.json({
      data: results[0]
    });
  });
});

router.post("/add-user", async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: SHA256(req.body.password)
  };

  var query = connection.query("INSERT INTO users SET ?", data, function(
    error,
    results,
    fields
  ) {
    if (error) throw error;

    res.json({
      data: "success"
    });
  });
});

router.post("/update-user", async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email
  };

  console.log(req.body);

  if (req.body.name == null || req.body.email == null || req.body.id == null) {
    return res.sendStatus(403);
  }

  connection.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [req.body.name, req.body.email, req.body.id],
    function(error, results, fields) {
      if (error) throw error;

      res.json({
        data: "success"
      });
    }
  );
});


router.post("/update-detail", async (req, res) => {
  const {
    avatar,
    city,
    country,
    email,
    first_name,
    gender,
    job_title,
    last_name,
    name,
    password,
    phone,
    postal_code,
    street_address,
    id,
  } = req.body;

  const data = {
    avatar,
    city,
    country,
    email,
    first_name,
    gender,
    job_title,
    last_name,
    name,
    password,
    phone,
    postal_code,
    street_address
  };

  console.log(req.body);

  if (req.body.id == null) {
    return res.sendStatus(403);
  }

  connection.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [req.body.name, req.body.email, req.body.id],
    function(error, results, fields) {
      if (error) throw error;
      connection.query(
        "UPDATE detail_user SET avatar = ?,  city = ?,  country = ?,  first_name = ?,  gender = ?,  job_title = ?,  last_name = ?,  phone = ?,  postal_code = ?,  street_address = ? WHERE id = ?",
        [
          avatar,
          city,
          country,
          first_name,
          gender,
          job_title,
          last_name,
          phone,
          postal_code,
          street_address,
          id
        ],
        function(error, results, fields) {
          if (error) throw error;
          res.json({
            data: "success"
          });
        }
      );
    }
  );
});


router.post("/delete-user", async (req, res) => {
  if (req.body.id == null) {
    return res.sendStatus(403);
  }

  connection.query("DELETE FROM users WHERE id = ?", [req.body.id], function(
    error,
    results,
    fields
  ) {
    if (error) throw error;

    res.json({
      data: "success"
    });
  });
});

function generate(user) {
  let identity = user.id + "-" + UUID();
  let key = UUID();
  let data = {
    identity: identity,
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      status: user.status
    }
  };

  return new Promise((resolve, reject) => {
    return JWT.sign(data, key, (error, token) => {
      if (error) return reject(error);

      resolve({ token: token, key: key, identity: identity });
    });
  });
}

router.post("/login", (req, res) => {
  console.log("email", req.body);
  var query = connection.query(
    "select * from users where email = ?",
    [req.body.email],
    function(err, data) {
      // console.log(req.body)
      console.log(data);
      if (err) {
        console.log(err);
        return next("Mysql error, check your query");
      }

      if (data.length < 1) {
        console.log({
          status: "Username Tidak ditemukan."
        });

        res.json({
          isValid: false,
          status: "Username Tidak ditemukan."
        });
      } else {
        if (
          req.body.email.toLowerCase() === data[0].email &&
          SHA256(req.body.password).toString() === data[0].password
        ) {
          // console.log('SHA256(req.body.password)', data[0].toJson())
          var token = JWT.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              name: data[0].name,
              email: data[0].email
            },
            UUID()
          );
          console.log({
            status: "Login berhasil."
          });

          console.log(data);

          res.json({
            isValid: true,
            token,
            email: data[0].email,
            status: "Berhasil Login"
          });
        } else {
          console.log({
            status: "Id / password salah."
          });

          res.json({
            status: "Id / password salah.",
            isValid: false
          });
        }
      }
    }
  );
});

module.exports = router;
