import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";  // Import the authentication hook

const Login = () => {
  const { login } = useAuth();  // Use the login function from useAuth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);  // Call the login function
      navigate("/");  // Redirect to home after successful login
    } catch (err) {
      setError(err?.response?.data?.message ||"Invalid email or password");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
