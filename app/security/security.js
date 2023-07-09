//jshint esversion:6
import {config} from "dotenv";
config();
import mongoose from "mongoose";
import express from "express";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";
import { google } from "googleapis";
import session from "express-session";
const OAuth2Client = google.auth.OAuth2;

const Router = express.Router();






Router.use(session({
    secret: "Our little secret.RANDOM sTring dlsfljd fsldfj sdlfjsdklfjsd lfjsdklfjsdlkfjlskdfjlsdkfjlsdfj",
    resave: false,
    saveUninitialized: false
  }));

Router.use(passport.initialize());
Router.use(passport.session());



const userSchema = new mongoose.Schema ({
  email: String,
  googleId: String,
  accessToken: String,
  refreshToken: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {

  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.googleId,
      googleId: user.googleId,
      email:user.email,
      refreshToken:user.refreshToken,
      accessToken:user.accessToken
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  accessType: "offline"
},

    async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
        return cb(null, user);

        } else {
        
        const newUser = new User({
            googleId: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            email: profile._json.email,
            username: profile.id
        });
        await newUser.save();
        return cb(null, newUser);
        }
    } catch (err) {
        return cb(err);
    }
    }
));




const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/auth/google/secrets"
);


const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

// Middleware for handling API authentication and authorization
const authenticateAPI = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    let accessToken = user.accessToken;
    let refreshToken = user.refreshToken;
    let email = user.email;

    console.log(email  , "email of the user who wants to send message");

    try {
      // Set the user's credentials in the OAuth2 client
      oAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      // Check if the access token is expired
      const now = Date.now();
      if (user.expiry_date && now >= user.expiry_date) {

        const { tokens } = await oAuth2Client.refreshAccessToken();
        accessToken = tokens.access_token;
        user.accessToken = accessToken;
        user.expiry_date = tokens.expiry_date;


        // Update the OAuth2 client with the new access token
        oAuth2Client.setCredentials({ access_token: accessToken });
         }

      // Attach the OAuth2 client to the request object for further API calls
      req.gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      req.refreshToken = refreshToken;
      req.accessToken = accessToken;
      req.email = email;

      return next();
    } catch (error) {
      console.error("Error authenticating API:", error);
      return res.status(500).send("Error authenticating API");
    }
  } else {
    return res.status(401).send("Unauthorized");
  }
};


Router.get("/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email", "https://mail.google.com"],
    accessType: "offline",
    prompt: "consent"
  }));
  
  
  Router.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/secret");
    });
  
  Router.get("/login", function(req, res){
    res.render("login");
  });

  Router.get("/secret", (req, res)=> {
    res.render("start-service");
  });
  


export {
    Router,
    isAuthenticated,
    authenticateAPI
};
