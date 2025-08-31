import axios from "axios";

axios.defaults.headers.post['Content-Type'] = 'application/json';
const instance = axios.create({
  baseURL: "http://localhost:5001/api", // backend URL
  withCredentials: true,               // send cookies for JWT
  headers: { "Content-Type": "application/json" }
});

export default instance;
