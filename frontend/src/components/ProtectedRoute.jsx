import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;