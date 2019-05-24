const axios = require("axios");

axios.interceptors.request.use(
  function(config) {
    config.headers = {
      "content-type": "application/json",
      "Authorization": "hashyouxi",
    }
    config.baseURL = "http://localhost:8080/";
    config.timeout = 3000;
    return config;
  },
  function(error) {
    console.log(`request error: ${error.message}`);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  function(response) {
    return response.data;
  },
  function(error) {
    console.log(`response error: ${error.message}`);
    return Promise.reject(error);
  },
);

module.exports = axios;
