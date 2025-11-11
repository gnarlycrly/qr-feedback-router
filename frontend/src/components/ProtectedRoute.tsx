import { Navigate } from "react-router-dom";
import { useContext } from "react";
import type {ReactElement} from "react";
import { AuthContext } from "../firebaseHelpers/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;// to be replaced with a loading page eventually
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
