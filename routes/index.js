const express = require('express');
var mysql = require('mysql');
// var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha512");

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'arkan14811',
  database: 'hacktiv8_test1'
});

connection.connect();

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    response: "Halloaaao"
  })
});


router.post('/login', (req, res) => {

  console.log('email', req.body)
  var query = connection.query("select * from users where email = ? ", req.body.email, function (err, data) {

    console.log(req.body)
    console.log(data);
    if (err) {
      console.log(err);
      return next("Mysql error, check your query");
    }

    if (data.length < 1) {

      console.log({
        status: 'Username Tidak ditemukan.'
      });

      res.json({
        isValid: false,
        status: 'Username Tidak ditemukan.'
      });

    } else {


      console.log('SHA256(req.body.password)', SHA256(req.body.password).toString(), data[0].password)



      if ((req.body.email.toLowerCase() === data[0].email) && (SHA256(req.body.password).toString() === data[0].password)) {

        console.log({
          status: 'Login berhasil.'
        });

        console.log(data)

        res.json({
          isValid: true,
          status: 'Berhasil Login'
        });

      } else {

        console.log({
          status: 'Id / password salah.'
        });

        res.json({
          status: 'Id / password salah.',
          isValid: false
        });

      }
    }
  });
});



module.exports = router;