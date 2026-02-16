import { useEffect, useState } from "react";
import axios from "axios";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/bookings", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBookings(res.data));
  }, []);

  return (
    <div className="container">
      <h2>All Bookings (Admin)</h2>
      {bookings.map((b: any) => (
        <div key={b._id} className="service-card">
          <p>Service: {b.service.name}</p>
          <p>Provider: {b.service.providerName}</p>
          <p>Contact: {b.service.contact}</p>
          <p>User: {b.user.name} ({b.user.email})</p>
        </div>
      ))}
    </div>
  );
};

export default AdminBookings;
