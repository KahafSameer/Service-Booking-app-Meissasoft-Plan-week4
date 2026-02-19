import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ role }: { role: string }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav-brand">Service Booking</Link>
      <Link to="/dashboard">Services</Link>
      {role === "customer" && <Link to="/my-bookings">My Bookings</Link>}
      {role === "admin" && <Link to="/admin">Admin</Link>}
      <button type="button" className="btn-link" onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
