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
        console.log(res);
        setBabies(res.data);
      } catch (err) {
        console.error("Failed to fetch babies:", err);
      }
    };

    if (user) fetchBabies();
  }, [user]);

  return (
    <div>
      <h2>Welcome {user?.name}</h2>

      <h3>Your Babies</h3>
      {babies.length > 0 ? (
        <ul>
          {babies.map((baby) => (
            <li key={baby._id}>
              {baby.name} — {baby.gender} —{" "}
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
