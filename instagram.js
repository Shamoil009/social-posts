// JPEG is the only image format supported
// Instagram accounts are limited to 50 API-published posts within a
//24-hour moving period. Carousels count as a single post. This limit
//is enforced on the POST /{ig-user-id}/media_publish endpoint when
//attempting to publish a media container. We recommend that your app
//also enforce the publishing rate limit, especially if your app
//allows app users to schedule posts to be published in the future.

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
      clientID: "1455900588293352",
      clientSecret: "930441a42b4be5ec6e745efd7583832b",
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
          `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1455900588293352&client_secret=930441a42b4be5ec6e745efd7583832b&fb_exchange_token=${accessToken}`
        )
        .catch((err) => {
          console.log(err);
        });
      console.log(longLivedUserAccessToken.data);

      const postData = {
        message: "Hello, this is my new post!",
      };

      // This should return a collection of Facebook Pages that the
      // current Facebook User can perform the MANAGE, CREATE_CONTENT, MODERATE, or ADVERTISE tasks on:
      // Capture the ID of the Facebook Page that's connected to the Instagram account that you
      // want to query. Keep in mind that your app users may be able to perform tasks on
      // multiple pages, so you eventually will have to introduce logic that can
      // determine the correct Page ID to capture (or devise a UI where your app
      // users can identify the correct Page for you).

      const FBPages = await axios.get(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedUserAccessToken.data.access_token}`
      );

      // get only first page data
      console.log(FBPages.data.data);
      let page_id = FBPages.data.data[1].id;

      const PageInstaBusinessAccount = await axios.get(
        `https://graph.facebook.com/v19.0/${page_id}?fields=instagram_business_account&access_token=${longLivedUserAccessToken.data.access_token}`
      );

      console.log(PageInstaBusinessAccount.data);

      const insta_account_id =
        PageInstaBusinessAccount.data.instagram_business_account.id;

      const InstaMediaObjects = await axios.get(
        `https://graph.facebook.com/v19.0/${insta_account_id}/media?access_token=${longLivedUserAccessToken.data.access_token}`
      );

      console.log(InstaMediaObjects.data);
      const imageUrl =
        // "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/400px-Sunflower_from_Silesia2.jpg";
        "https://images.unsplash.com/photo-1533450718592-29d45635f0a9?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      const caption = "my first automate image posting on instagram #BronzFonz";

      const createContainer = await axios.post(
        `https://graph.facebook.com/v19.0/${insta_account_id}/media`,

        {
          image_url: imageUrl,
          caption: caption,
          access_token: longLivedUserAccessToken.data.access_token,
        }
      );

      console.log(createContainer.data);

      // insta account id 17841464813387210
      const message = "this is post from node js with images 22";

      const formSimple = {
        message: message,
        source: fs.createReadStream("./791.jpg"),
      };

      const publishContainerIg = await axios.post(
        `https://graph.facebook.com/v19.0/${insta_account_id}/media_publish?creation_id=${createContainer.data.id}`,

        {
          // image_url: imageUrl,
          // caption: caption,
          access_token: longLivedUserAccessToken.data.access_token,
        }
      );

      console.log(publishContainerIg.data);
    }
  )
);

let codeGlobal;
let accessTokenGlobal;
let refreshTokenGlobal;

const callbackURL = "http://localhost:4000/api/custom/twitter/callback";

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "instagram_graph_user_media",
      // 'business_management'

      'pages_show_list',
      // pages_read_engagement
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
  console.log(`App's running on port: ${process.env.PORT || 4000}`);
});

// images limitation
// Format: JPEG
// File size: 8 MB maximum.
// Aspect ratio: Must be within a 4:5 to 1.91:1 range
// Minimum width: 320 (will be scaled up to the minimum if necessary)
// Maximum width: 1440 (will be scaled down to the maximum if necessary)
// Height: Varies, depending on width and aspect ratio
// Color Space: sRGB. Images using other color spaces will have their color spaces converted to sRGB.
