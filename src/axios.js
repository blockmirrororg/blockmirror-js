const axios = require("axios");

axios.interceptors.request.use(
  function(config) {
    config.headers = { "Content-Type": "application/json" };
    config.baseURL = "http://localhost:8080/";
    config.timeout = 3000;
    return config;
  },
  function(error) {
    console.log(`request error: ${error.message}`);
    return Promise.reject(error);
  },
);

// 响应拦截（配置请求回来的信息）
axios.interceptors.response.use(
  function(response) {
    return response.data;
  },
  function(error) {
    console.log(JSON.stringify(error));
    console.log(`response error: ${error.message}`);
    return Promise.reject(error);
  },
);

module.exports = axios;
