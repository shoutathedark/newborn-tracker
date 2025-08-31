import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "../api/axiosConfig";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Try refresh token on mount
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await axios.post("/auth/refresh");
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };
    refresh();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const register = async (name, username, password) => {
    const res = await axios.post("/auth/register", { name, username, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
