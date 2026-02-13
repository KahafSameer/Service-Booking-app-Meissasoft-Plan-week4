import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const r = localStorage.getItem("role");
    if (r) setRole(r);

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(res.data.message);
      } catch (err) {
        console.error(err);
        alert("session expired, please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Role: <strong>{role}</strong></p>
      <p>{message}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}



