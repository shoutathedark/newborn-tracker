import { createContext, useState, useEffect } from "react";
import axios from "../api/axiosConfig";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [babies, setBabies] = useState([]);
  const [activeBaby, setActiveBaby] = useState(null);
  

  // Fetch babies linked to user
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const res = await axios.get("/babies");
        const babyList = res.data?.babies || res.data || [];
        setBabies(babyList);

        if (babyList.length > 0) {
          const savedId = sessionStorage.getItem("activeBabyId");
          const found = babyList.find((b) => b._id === savedId);
          setActiveBaby(found || babyList[0] || null);

          sessionStorage.setItem(
            "activeBabyId",
            (found || babyList[0])._id
          );
        } else {
          setActiveBaby(null);
          sessionStorage.removeItem("activeBabyId");
        }
      } catch (err) {
        console.error("Failed to fetch babies:", err);
      }
    };

    if (user) fetchBabies();
  }, [user]);

  // Persist activeBabyId when switching
  useEffect(() => {
  if (activeBaby) {
    sessionStorage.setItem("activeBabyId", activeBaby._id);
  }
}, [activeBaby]);

  // Try refresh token on mount
  useEffect(() => {
    
    const refresh = async () => {
      try {
        const res = await axios.post("/auth?action=refresh");
        setUser(res.data.user);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        setUser(null);
        sessionStorage.removeItem("user");
        if (window.location.pathname !== "/login"){
        window.location.href = "/login";
        }
      }
    };

    refresh();
  }, []);

  const login = async (username, password) => {
    const res = await axios.post("/auth?action=login", { username, password });
    setUser(res.data.user);
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const register = async (name, username, password) => {
    const res = await axios.post("/auth?action=register", { name, username, password });
    setUser(res.data.user);
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const logout = async () => {
    await axios.post("/auth?action=logout");
    setUser(null);
    setBabies([]);
    setActiveBaby(null);
    sessionStorage.removeItem("activeBabyId");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, babies, setBabies, activeBaby, setActiveBaby }}>
      {children}
    </AuthContext.Provider>
  );
};