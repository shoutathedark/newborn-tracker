import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosConfig";

export default function Room() {
  const { roomId } = useParams();
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`/rooms/${roomId}/logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/rooms/${roomId}/logs`, { notes: newLog, type: "feeding" });
      setNewLog("");  // Clear input
      setLogs((prevLogs) => [...prevLogs, { notes: newLog, type: "feeding" }]);
    } catch (err) {
      console.error("Error adding log:", err);
    }
  };

  return (
    <div>
      <h2>Room Logs</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={newLog} 
          onChange={(e) => setNewLog(e.target.value)} 
          placeholder="Enter log details..." 
          required
        />
        <button type="submit">Add Log</button>
      </form>

      <ul>
        {logs.length ? (
          logs.map((log) => (
            <li key={log._id}>
              <strong>{log.type}</strong>: {log.notes} ({new Date(log.timestamp).toLocaleString()})
            </li>
          ))
        ) : (
          <p>No logs available for this room.</p>
        )}
      </ul>
    </div>
  );
}
