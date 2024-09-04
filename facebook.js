var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
const fs = require("fs");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const express = require("express");
const { default: axios } = require("axios");
const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// facebook config id 1360534901265731
passport.use(
  new FacebookStrategy(
    {
      clientID: "process.env.FB_CLIENT_ID",
      clientSecret: "process.env.FB_CLIENT_SECRET",
      callbackURL: "http://localhost:4000/auth/facebook/callback",
      // state: true,
      //   profileFields: ["id", "displayName", "photos", "email"],
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);

      //   token usable for 60 days
      const longLivedUserAccessToken = await axios
        .get(
          `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&fb_exchange_token=${accessToken}`
        )
        .catch((err) => {
          console.log(err);
        });
      console.log(longLivedUserAccessToken.data);

      const postData = {
        message: "Hello, this is my new post!",
      };

      //   to get account info and extract pages access_token
      const pages = await axios.get(`https://graph.facebook.com/me/accounts`, {
        params: {
          access_token: longLivedUserAccessToken.data.access_token,
        },
      });

      // get only first page data
      console.log(pages.data);
      let page_id = pages.data.data[0].id;

      const message = "this is post from node js with images 22";

      const formSimple = {
        message: message,
        source: fs.createReadStream("./791.jpg"),
      };

      const postOnPage = await axios.post(
        `https://graph.facebook.com/v19.0/${page_id}/photos`,
        formSimple,
        {
          params: {
            access_token: pages.data.data[0].access_token,
          },
          headers: {
            "Content-Type": `multipart/form-data;`,
          },
        }
      );

      console.log(postOnPage.data);
    }
  )
);

const callbackURL = "http://localhost:4000/api/custom/twitter/callback";

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: [
      // "user_friends",
      // "manage_pages", //invalid
      "pages_manage_posts",
      // "instagram_content_publish",
      "pages_manage_engagement",
      "pages_manage_metadata",
      // "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
    ],
  })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("suceess redirect hehe");
    res.send("suceess redirect hehe");

    // res.redirect("/");
  }
);

app.listen(process.env.PORT || 4000, () => {
  console.log(`App's running on port: ${process.env.PORT}`);
});
