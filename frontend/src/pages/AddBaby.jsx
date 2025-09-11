import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const AddBaby = () => {
  const [newBaby, setNewBaby] = useState({ name: "", dob: "", gender: "male" });
  const navigate = useNavigate();

  const handleAddBaby = async (e) => {
    e.preventDefault();
    try {
      await api.post("/babies", newBaby);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add baby:", err);
    }
  };

  return (
    <div style = {{padding:"1rem"}}>
      <h2>Add New Baby</h2>
      <form onSubmit={handleAddBaby}>
        <label htmlFor = "name">Name:</label>
        <input
          id = "name"
          type="text"
          placeholder="Name"
          value={newBaby.name}
          onChange={(e) => setNewBaby({ ...newBaby, name: e.target.value })}
          required
        />
        <label htmlFor = "birthday">Birthday:</label>
        <input
          id = "birthday"
          type="date"
          value={newBaby.dob}
          onChange={(e) => setNewBaby({ ...newBaby, dob: e.target.value })}
          required
        />
        <label htmlFor = "gender">Gender:</label>
        <select
          id = "gender"
          value={newBaby.gender}
          onChange={(e) => setNewBaby({ ...newBaby, gender: e.target.value })}
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">Save Baby</button>
      </form>
    </div>
  );
};

export default AddBaby;
