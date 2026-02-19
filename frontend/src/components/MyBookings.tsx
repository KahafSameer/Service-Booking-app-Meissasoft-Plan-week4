import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";

interface Service {
  id: number;
  title: string;
  category: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
}

interface Booking {
  id: number;
  service: Service;
  createdAt: string;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const role = localStorage.getItem("role") || "customer";

  const fetchBookings = async () => {
    try {
      const res = await api.get("/booking/my");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/booking/${bookingId}`);
      setMsg("Booking cancelled");
      fetchBookings();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Cancel failed");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="container">
      <Navbar role={role} />
      <h2>My Bookings</h2>
      {msg && <p className={`msg ${msg.includes("cancelled") ? "success" : "error"}`}>{msg}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet. <Link to="/dashboard">Browse services</Link> to book.</p>
      ) : (
        <div className="card-grid">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <h4>{b.service?.title}</h4>
              <p className="meta">Category: {b.service?.category}</p>
              <p className="meta">Provider: {b.service?.providerName}</p>
              <p className="meta">Contact: {b.service?.contactEmail} | {b.service?.contactPhone}</p>
              <p className="meta">{new Date(b.createdAt).toLocaleString()}</p>
              <button className="btn-small btn-danger" onClick={() => handleCancel(b.id)}>Cancel Booking</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
