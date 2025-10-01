import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AddBaby from "./pages/AddBaby";
import Register from "./pages/Register";
import Logs from "./pages/AddEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import {AuthProvider} from "./context/AuthProvider";

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-baby"
          element={
            <ProtectedRoute>
              <AddBaby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddEvent/:babyId"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <ToastContainer />
      <Navbar />
    </Router>
    </AuthProvider>
  );
};

export default App;