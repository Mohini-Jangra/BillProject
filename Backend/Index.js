const Connection = require("./Connection")
const express = require("express")
const cors= require("cors")
const dotenv= require("dotenv").config()
const {User,Shopkeeper,Executive}= require("./Model/UserModel/UserModel")
const Routes= require("./Route/Route")
const app = express()
app.use(express.json())
app.use(cors())
Connection()

app.use("/api",Routes)

app.listen(4010,()=>console.log("Server started at:4010"))