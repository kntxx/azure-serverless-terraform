import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

// Protects routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirects logged-in users away from auth pages (login/register)
export const PublicRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (userLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};
