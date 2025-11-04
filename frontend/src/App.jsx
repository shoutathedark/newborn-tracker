import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PullToRefresh from "pulltorefreshjs";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AddBaby from "./pages/AddBaby";
import Register from "./pages/Register";
import Timeline from "./pages/Timeline";
import Logs from "./pages/AddEvent";
import SettingsPage from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import {AuthProvider} from "./context/AuthProvider";

const App = () => {
    useEffect(() => {
    PullToRefresh.init({
      mainElement: "body",
      onRefresh() {
        window.location.reload();
      },
      instructionsPullToRefresh: "Pull down to refresh",
      instructionsReleaseToRefresh: "Release to refresh",
      instructionsRefreshing: "Refreshing...",
      iconArrow: "↓",
      iconRefreshing: "⟳",
      shouldPullToRefresh: () => window.scrollY === 0,
      distThreshold: 60,
    });

    return () => {
      PullToRefresh.destroyAll();
    };
  }, []);
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
        <Route
          path="/Timeline"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
      </Routes>
      <ToastContainer />
      <Navbar />
    </Router>
    </AuthProvider>
  );
};

export default App;