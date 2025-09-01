import { useEffect, useState, useContext } from "react";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const [babies, setBabies] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const res = await api.get("/babies/get");
        console.log(res);
        setBabies(res.data.babies);
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
            <li key={baby._id}>{baby.name}</li>
          ))}
        </ul>
      ) : (
        <p>No babies found</p>
      )}
    </div>
  );
};

export default Home;
