import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

interface Service {
  id: string;
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
  const role = localStorage.getItem("role") || "customer";

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (id: string) => {
    try {
      const res = await api.post(`/booking/${id}`); // ✅ use id, not service._id
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
      <h2>Services</h2>
      {message && <p className="msg success">{message}</p>}
      {services.map((s) => (
        <div key={s.id} className="card">
          <h3>{s.title}</h3>
          <p>Category: {s.category}</p>
          <p>Provider: {s.providerName}</p>
          <p>Contact: {s.contactEmail} | {s.contactPhone}</p>
          <p>Bookings: {s.currentBookings}/{s.maxBookings}</p>
          <button
            onClick={() => handleBooking(s.id)}
            disabled={!s.available || s.currentBookings >= s.maxBookings}
          >
            {s.currentBookings >= s.maxBookings ? "Full" : "Book"}
          </button>

        </div>
      ))}
    </div>
  );
};

export default Dashboard;
