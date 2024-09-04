const axios = require('axios');

const USER_ID = 'process.env.FB_USER_ID'; // Replace with your Facebook User ID

// const ACCESS_TOKEN = '1386080598934973|H8PRo_z2XisYJ8qh77RwXG3vpUg'; // Replace with your access token
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN; // Replace with your access token


const postData = {
  message: 'Hello, this is my new post!',
};

const postUrl = `https://graph.facebook.com/v13.0/${USER_ID}/feed`;

axios.post(postUrl, postData, {
  params: {
    access_token: ACCESS_TOKEN,
  },
})
.then(response => {
  console.log('Post successful:', response.data);
})
.catch(error => {
  console.error('Error posting:', error.response.data);
});
