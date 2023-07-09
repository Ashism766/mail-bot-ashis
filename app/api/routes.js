import express from "express";
import {config} from "dotenv";
config();
import { authenticateAPI } from "../security/security.js";
// import logger from "../utils/logger.js";
const apiRouter = express.Router();
import {emailQueue} from "./queue.js";


apiRouter.get("/inbox", authenticateAPI, async (req, res) => {
    try {
      const { gmail, refreshToken, accessToken, email } = req; // Extract required data from req object
  
      await emailQueue.createJob({ gmail, refreshToken, accessToken, email }).save(); // Pass extracted data to createJob()
  
      res.status(201).send("<h1> Your email bot is Started it'll start working soon.</h1>");
    } catch (err) {
      res.status(500).send("Some error occurred");
      console.log(err);
    }
  });
  




export {apiRouter};