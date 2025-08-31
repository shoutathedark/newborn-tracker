import axios from "axios";

axios.defaults.headers.post['Content-Type'] = 'application/json';
const instance = axios.create({
  baseURL: "import.meta.env.VITE_API_URL", // backend URL
  withCredentials: true,               // send cookies for JWT
  headers: { "Content-Type": "application/json" }
});

export default instance;
