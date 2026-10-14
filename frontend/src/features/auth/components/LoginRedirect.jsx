import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function LoginRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
