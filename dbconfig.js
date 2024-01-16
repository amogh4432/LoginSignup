require('dotenv').config()
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
  });


  connection.connect((err) => {
    if(err){
        console.log(err)
    }
    else{

        console.log("Database created succesfully")

        connection.query(`CREATE TABLE IF NOT EXISTS user_info ( email VARCHAR(45) NOT NULL,password VARCHAR(99) NOT NULL,name VARCHAR(45) NOT NULL, PRIMARY KEY (email));`,
            function (err, results, fields) {
                if(err){
                    console.log(err)
                }
                else{
                    console.log("user_info table created successfully")
                }
            }
          );

    }
  })

module.exports=connection