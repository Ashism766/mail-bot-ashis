import {config} from  "dotenv";
config();
import express  from "express";
import cors from "cors";
import logger from "./app/utils/logger.js";
import { apiRouter } from "./app/api/routes.js";
import { Router as Security, isAuthenticated } from "./app/security/security.js";
import mongoose from "mongoose";
import { startCornJob } from "./app/api/queue.js";

global.logger = logger;


const app = express();
mongoose.connect("mongodb://localhost:27017/AshisAuth", {useNewUrlParser: true});


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());



app.use(Security);
app.use(isAuthenticated);
app.use(apiRouter);

startCornJob();






app.get("/", (req, res)=>{
    res.render("home");
});






const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server started on port ${port}`);
logger.info(`Server started on port ${port}..............................................................`);
});