import { Navigate } from "react-router-dom";
import { useContext} from "react";
import type { ReactElement } from "react";
import { AuthContext } from "../firebaseHelpers/AuthContext";

const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/portal" replace />;
  return children; // render login/signup pages if not logged in
};

export default PublicRoute;
