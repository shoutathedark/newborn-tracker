import useAuth from "./useAuth";  // Import the custom hook
import { AuthContext } from "./AuthContext"; 

export const AuthProvider = ({ children }) => {
  const auth = useAuth();  // Use the hook to get auth state and methods

  return (
    <AuthContext.Provider value={auth}>
      {children}  {/* Wrap the children with the context provider */}
    </AuthContext.Provider>
  );
};

export default AuthProvider;