require('dotenv').config()
const dbConnection=require("./dbconfig")
const express=require('express')
const cookieParser = require("cookie-parser");

const app =express()

app.use(express.json())
app.use(cookieParser())

const userRouter=require("./router/user")
app.use("/api",userRouter)

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})
