import { useState, useEffect } from "react";
import axios from "../api/axiosConfig";  // Your axios configuration
import * as jwtDecode from "jwt-decode";

const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Call the backend API to authenticate the user
      const response = await axios.post("/auth/login", { email, password });
      document.cookie = `token=${response.data.token}; path=/;`;  // Store token in cookie
      await fetchUser();
    } catch (err) {
      console.error("Login failed: ", err);
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    setUser(null);
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"; // Remove token
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  const fetchUser = async () => {
    try {
      await axios.post("/auth/refresh");  // Refresh user
      const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
      if (token) {
        const decoded = jwtDecode.decode(token);  // Decode JWT to get user data
        setUser(decoded);
      }
    } catch (err) {
      console.error("Error fetching user: ", err);
      setUser(null);  // Reset user state on error
    }
  };

  useEffect(() => {
    fetchUser();  // Fetch user data on component mount
  }, []);

  return { user, login, logout };
};

export default useAuth;