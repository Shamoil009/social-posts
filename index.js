const axios = require('axios');

const USER_ID = '61553251963819'; // Replace with your Facebook User ID

// const USER_ID = '1386080598934973'; // Replace with your Facebook User ID


// const ACCESS_TOKEN = '1386080598934973|H8PRo_z2XisYJ8qh77RwXG3vpUg'; // Replace with your access token
const ACCESS_TOKEN = 'EAAM2GMsXmGwBOwZB7pGuGIwpQzTKTeF0HyDjmDKxtqjPhxr3wTji1AZCHts7K9PuLfhj3NTZBytluTAgCAO1Mrqb3dQKpWsM1PSqpAFKFsRA4FnK2i8H2FhthoBgCykZC1uuPrp1M0dtEmAfxd6IigLA4z0PZCaDvaQrKzLIUVBg8OuhPMCkFn2o84wqOYE4tYho5bDUywdJdfvqTEXf4ZA3BPt9jMWDL450ED'; // Replace with your access token


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
