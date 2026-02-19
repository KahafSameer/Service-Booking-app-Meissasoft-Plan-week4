import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

interface Service {
  id: number;
  title: string;
  category: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
  available: boolean;
  currentBookings: number;
  maxBookings: number;
}

const Dashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role") || "customer";

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (id: number) => {
    try {
      const res = await api.post(`/booking/${id}`);
      setMessage(res.data.message || "Booking created");
      fetchServices();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container">
      <Navbar role={role} />
      <h2>Available Services</h2>
      {message && <p className={`msg ${message.includes("failed") || message.includes("Failed") ? "error" : "success"}`}>{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <div className="card-grid">
          {services.map((s) => (
            <div key={s.id} className="card">
              <h3>{s.title}</h3>
              <p className="meta">Category: {s.category}</p>
              <p className="meta">Provider: {s.providerName}</p>
              <p className="meta">Contact: {s.contactEmail} | {s.contactPhone}</p>
              <p className="slots">Slots: {s.currentBookings}/{s.maxBookings}</p>
              <button
                className="btn-primary"
                onClick={() => handleBooking(s.id)}
                disabled={!s.available || s.currentBookings >= s.maxBookings}
              >
                {s.currentBookings >= s.maxBookings ? "Full" : "Book Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
