// Import the useContext hook from React
import { useContext } from "react";
// Import the AuthContext object from the components directory
import { AuthContext } from "../components/AuthContext";

// Custom hook to access the AuthContext easily in components
export function useAuth() {
  // Return the current context value for AuthContext
  return useContext(AuthContext);
}
