import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/">Home</Link> |{" "}
      {user ? (
        <>
          <span>Welcome, {user.name}</span>
          <button onClick={logout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;