import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthProvider";
import { toast } from "react-toastify";
import loginimage from "../resources/Dubu.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth?action=login", formData);
      setUser(res.data.user);
      console.log(res);
      toast.success("Login successful!");
      navigate("/"); 
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message|| "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="flex h-screen no-auth">
      {/* Left image section (hidden on small screens) */}
      <div className="hidden md:flex w-1/2">
        <img
          src={loginimage}// replace with your actual image path
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right form section - fills the entire half */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="login w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">
            Sign in to your account
          </h2>

          {/* Username */}
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center mb-8">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;