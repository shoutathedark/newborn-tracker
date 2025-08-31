import { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Fetch rooms the logged-in user is part of
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    if (user) {
      fetchRooms();
    }
  }, [user]);

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <h3>Your Rooms:</h3>
      <ul>
        {rooms.length ? (
          rooms.map((room) => (
            <li key={room._id}>
              <Link to={`/room/${room._id}`}>{room.name}</Link>
            </li>
          ))
        ) : (
          <p>You haven't joined any rooms yet.</p>
        )}
      </ul>
    </div>
  );
}
