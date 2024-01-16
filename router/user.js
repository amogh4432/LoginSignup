const express = require("express");
const router = express.Router();
const dbConnection = require("../dbconfig");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt =require("jsonwebtoken")

function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

const authorization = (req, res, next) => {
  const token = req.cookies.jwt_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, process.env.PRIVATE_KEY);
    req.email = data.email;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!validateEmail(email)) {
    return res.status(401).json("Invalid email format");
  }
  if (password.length < 6) {
    return res.status(401).json("password should be greater than 6 letters");
  }
  dbConnection.query(
    `SELECT * FROM user_info where email="${email}";`,
    function (err, results, fields) {
      if (err) {
        return res.json(err);
      }
      
      if (results.length) {
        return res.json("user already exists");
      }
      
      console.log("checking>>>>>>>>. before bcrypt hash")
      bcrypt.hash(password, saltRounds, function (err, hash) {
        console.log("checking>>>>>>>>. between bcrypt hash")
        if (err) {
          return res.status(401).json(err);
        }
        dbConnection.query(
          `INSERT INTO user_info (email, password, name) VALUES (?,?,?);`,
          [email, hash, name],
          function (err, results, fields) {
            if (err) {
              console.log(err);
              return res.json(err);
            }
            jwt.sign({email}, process.env.PRIVATE_KEY,{expiresIn:'4h'}, function(err, token) {
              if(err){
                console.log(err)
                return res.json(err)
              }
              else{
                res.cookie("jwt_token",token,{
                  httpOnly: true
                }).status(200).json({results,msg:"jwt_token send successfully"})
              }
            })
          }
        )
      })
      console.log("checking>>>>>>>>. after bcrypt hash")
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email) || password.length < 6) {
    return res.json({
      error: "Invalid Credentials",
    });
  }
  dbConnection.query(
    `select * from user_info where email="${email}"`,
    (err, results) => {
      if (err) {
        return res.json({ error: err });
      }
      if ((results.length==0)) {
        return res.json("user doesn't exists");
      }
      bcrypt.compare(password, results[0].password, function (err, results) {
        if (err) {
          return res.json(err);
        }
        if (results) {
          jwt.sign({email}, process.env.PRIVATE_KEY,{expiresIn:'4h'}, function(err, token) {
            if(err){
              console.log(err)
              return res.json(err)
            }
            res.cookie("jwt_token",token,{
              httpOnly: true
            }).status(200).json({results,msg:"jwt_token send successfully"})
          })
          } 
        else {
          res.json("invalid Credential");
        }
      });
    }
  );
});

router.post("/logout", authorization, (req, res) => {
  return res
    .clearCookie("jwt_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});

module.exports = router;
