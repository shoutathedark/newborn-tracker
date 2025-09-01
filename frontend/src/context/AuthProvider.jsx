// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "../api/axiosConfig";


const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try refresh token on mount
  useEffect(() => {
    const refresh = async () => {
      const currentPath = window.location.pathname;

      try {
        const res = await axios.post("/auth/refresh");
        setUser(res.data.user);
        console.log(res);
      } catch {
        setUser(null);
      }
       finally{
        setLoading(false);
       }
    };

    refresh();
  }, []);

  const login = async (username, password) => {
    const res = await axios.post("/auth/login", { username, password });

    setUser(res.data.user);
  };

  const register = async (name, username, password) => {
    const res = await axios.post("/auth/register", { name, username, password });

    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setUser(null);
    // redirect to login after logout
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
