import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { format } from "date-fns-tz";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthProvider";

const Logs = () => {
  const { babyId } = useParams();
  const { user } = useContext(AuthContext);
  const [baby, setBaby] = useState(null);
  const [events, setEvents] = useState([]);

  // Form state
  const [showPopup, setShowPopup] = useState(false);
  const [type, setType] = useState("feeding");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [diaperType, setDiaperType] = useState("pee");
  const [diaperConsistency, setDiaperConsistency] = useState("soft");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd HH:mm:ss", { timeZone: "Asia/Singapore" })
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBabyAndEvents = async () => {
      try {
        const resBaby = await api.get(`/babies/${babyId}`);
        setBaby(resBaby.data);

        const resEvents = await api.get(`/logs/${babyId}/events`);
        setEvents(resEvents.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    if (babyId) fetchBabyAndEvents();
  }, [babyId]);

  const handleAddEvent = async (e) => {
    e.preventDefault();

    const errors = [];
    if (!type) errors.push("Event type is required");

    if (type === "feeding" && !amount) errors.push("Amount is required for feeding");
    if (type === "sleeping" && !duration) errors.push("Duration is required for sleeping");
    if (type === "diaper") {
      if (!diaperType) errors.push("Diaper type is required");
      if (!diaperConsistency) errors.push("Diaper consistency is required");
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      return;
    }

    let payload = { type, notes, timestamp: timestamp };

    if (type === "feeding") {
      payload.amount = Number(amount);
    } else if (type === "sleeping") {
      payload.duration = Number(duration);
    } else if (type === "diaper") {
      payload.diaper = {
        type: diaperType,
        consistency: diaperConsistency,
      };
    }

    try {
      const res = await api.post(`/logs/${babyId}/events`, payload);
      console.log(res);
      setEvents((prev) => [res.data, ...prev]);
      toast.success("Event logged!")
      // reset form
      setAmount("");
      setDuration("");
      setNotes("");
      setType("feeding");
      setTimestamp(new Date().toISOString().slice(0, 16));
    } catch (err) {
      console.error("Failed to add event:", err);
      toast.error("Error adding event.")
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
        <div className = "display-flex justify-content-space-between">
            <h2>{baby ? `${baby.name}'s Events` : "Loading..."}</h2>
            <button className = "btn" onClick={() => navigate("/")}>← Back to Home</button>
        </div>

      <form onSubmit={handleAddEvent}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Event Type: </label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="feeding">Feeding</option>
            <option value="sleeping">Sleeping</option>
            <option value="shower">Shower</option>
            <option value="diaper">Diaper</option>
          </select>
        </div>

        {/* Conditional fields */}
        {type === "feeding" && (
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Amount (ml): </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        )}

        {type === "sleeping" && (
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Duration (minutes): </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        )}

        {type === "diaper" && (
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Type: </label>
            <select value={diaperType} onChange={(e) => setDiaperType(e.target.value)}>
              <option value="pee">Pee</option>
              <option value="poop">Poop</option>
              <option value="mixed">Mixed</option>
            </select>

            <label style={{ marginLeft: "1rem" }}>Consistency: </label>
            <select
              value={diaperConsistency}
              onChange={(e) => setDiaperConsistency(e.target.value)}
            >
              <option value="soft">Soft</option>
              <option value="firm">Firm</option>
              <option value="runny">Runny</option>
              <option value="watery">Watery</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Notes (optional): </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />
        </div>

        {/* Timestamp */}
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Time: </label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        <button className = "btn" type="submit">Add Event</button>
      </form>

      {/* Events list */}
      {events.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>
                Type
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>
                Details
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>
                Caregiver
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id}>
                <td style={{ padding: "0.5rem" }}>{ev.type}</td>
                <td style={{ padding: "0.5rem" }}>
                  {ev.type === "feeding" && `Amount: ${ev.amount} ml`}
                  {ev.type === "sleeping" && `Duration: ${ev.duration} mins`}
                  {ev.type === "diaper" &&
                    `Type: ${ev.diaper?.type}, Consistency: ${ev.diaper?.consistency}`}
                  {ev.type === "shower" && "Shower taken"}
                  {ev.notes && ` | Notes: ${ev.notes}`}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {ev.caregiverId?.name || ev.caregiverId?.username}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {new Date(ev.timestamp || ev.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No events added yet</p>
      )}
    </div>
  );
};

export default Logs;
