// const Twit = require("twit");
// // const config = require('./config'); // Create a config.js file to store your Twitter API credentials

// const T = new Twit({
//   consumer_key: process.env.TW_CONSUMER_KEY,
//   consumer_secret: process.env.TW_CONSUMER_SECRET,
//   access_token: process.env.TW_ACCESS_TOKEN,
//   access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET,
// });

// // The user ID or screen name of the user on whose behalf you want to post
// const targetUser = "LFG Sports Dev";

// // The tweet content
// const tweetText = "Hello, Twitter!";

// // Post a tweet on behalf of the target user
// T.post(
//   "statuses/update",
//   { status: tweetText },
//   function (err, data, response) {
//     if (err) {
//       console.error("Error posting tweet:", err);
//     } else {
//       console.log("Tweet posted successfully:", data);
//     }
//   }
// );

// const { TwitterApi }=require('twitter-api-v2');

// // Instantiate with desired auth type (here's Bearer v2 auth)
// const twitterClient = new TwitterApi('eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.....');

// // Tell typescript it's a readonly app
// const readOnlyClient = twitterClient.readOnly;

// // Play with the built in methods
// const twitteing= async ()=>{

//     const user = await readOnlyClient.v2.usersByUsernames('LFG Sports Dev');
//     await twitterClient.v2.tweet('Hello, this is a test.');
// }
// console.log(twitteing());
// You can upload media easily!
// await twitterClient.v1.uploadMedia('./big-buck-bunny.mp4');

const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Twitter API init
const TwitterApi = require("twitter-api-v2").default;
const twitterClient = new TwitterApi({
  clientId: process.env.TW_CLIENT_ID,
  clientSecret: process.env.TW_CLIENT_SECRET,
});

let codeGlobal;
let accessTokenGlobal;
let refreshTokenGlobal;
// let stateGlobal;

const callbackURL = "http://localhost:4000/api/custom/twitter/callback";

app.get("/", async function (req, res) {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] } // ofline access to get refresh_token
  );

  // save in database
  codeGlobal = codeVerifier;
  console.log(codeVerifier);
  console.log(state);

  res.redirect(url); // redirect to twitter
});

app.get("/api/custom/twitter/callback", async function (req, res) {
  const { state, code } = req.query; // store in DB

  // get codeVerifier and state from DB to match current values
  // skiping it for now
  // const { codeVerifier, state: storedState } = dbSnapshot.data();

  // if (state !== storedState) {
  //   return response.status(400).send('Stored tokens do not match!');
  // }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code,
    // codeVerifier,
    codeVerifier: codeGlobal,
    redirectUri: callbackURL,
  });

  // save in DB
  // await dbRef.set({ accessToken, refreshToken });
  accessTokenGlobal = accessToken;
  refreshTokenGlobal = refreshToken;

  const { data } = await loggedClient.v2.me(); // start using the client if you want

  res.send(data);
});

app.get("/tweet", async function (req, res) {
  // get refreshToken from DB
  // const { refreshToken } = (await dbRef.get()).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(
    // refreshToken
    refreshTokenGlobal
  );

  // save new refreshed token in DB
  // await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  const { data } = await refreshedClient.v2.tweet("Hi my first Tweet");

  res.send(data);
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`App's running on port: ${process.env.PORT}`);
  // console.log(io);
});

// for media uploading

// You can use media IDs generated by v1 API to send medias!
// const mediaId = await client.v1.uploadMedia('./image.png');

// await client.v2.tweetThread([
//   'Hello, lets talk about Twitter!',
//   { text: 'Twitter is a fantastic social network. Look at this:', media: { media_ids: [mediaId] } },
//   'This thread is automatically made with twitter-api-v2 :D',
// ]);
