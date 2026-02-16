import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
