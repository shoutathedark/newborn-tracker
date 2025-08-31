// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext"; // Ensure this import is correct
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";
import React, {useContext} from 'react';

function PrivateRoute({ children }) {
  const { user } = React.useContext(AuthContext);  // Use AuthContext to check if user is authenticated
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const { user, logout } = useContext(AuthContext);  // Access user from AuthContext

  return (
    <Router>
      <Navbar user={user} logout={logout} />  {/* Pass user info to Navbar */}
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/room/:roomId" element={<PrivateRoute><Room /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;