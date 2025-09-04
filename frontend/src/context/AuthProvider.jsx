import { createContext, useState, useEffect } from "react";
//import { AuthContext } from "./AuthContext";
import axios from "../api/axiosConfig";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try refresh token on mount
  useEffect(() => {
    const refresh = async () => {
      const currentPath = window.location.pathname;

      try {
        const res = await axios.post("/auth/refresh");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
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
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const register = async (name, username, password) => {
    const res = await axios.post("/auth/register", { name, username, password });
    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    // 🔑 Don’t render routes yet → prevents flashing
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

//export default AuthProvider;
