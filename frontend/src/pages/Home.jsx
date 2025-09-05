import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthProvider";

const Home = () => {
  const [babies, setBabies] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const res = await api.get("/babies");
        setBabies(res.data);
      } catch (err) {
        console.error("Failed to fetch babies:", err);
      }
    };

    if (user) fetchBabies();
  }, [user]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome {user?.name}</h2>

      <h3>Your Babies</h3>
      {babies.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {babies.map((baby) => (
            <li
              key={baby._id}
              style={{
                marginBottom: "0.5rem",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/logs/${baby._id}`)}
            >
              <strong>{baby.name}</strong> — {baby.gender} —{" "}
              {new Date(baby.dob).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No babies found</p>
      )}

      <button onClick={() => navigate("/add-baby")}>Add New Baby</button>
    </div>
  );
};

export default Home;
