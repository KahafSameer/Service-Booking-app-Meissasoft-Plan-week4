import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

const CATEGORIES = [
  "DevOps", "DevSecOps", "MLOps", "Cloud Infrastructure",
  "CI/CD Automation", "Containerization", "Kubernetes Management",
  "Monitoring & Logging", "Security & Compliance"
];

interface Service {
  _id: string;
  title: string;
  category: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
  currentBookings: number;
  maxBookings: number;
}

interface Booking {
  _id: string;
  user: { name: string; email: string; role?: string };
  service: Service;
}

const AdminDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newService, setNewService] = useState({
    title: "",
    category: CATEGORIES[0],
    providerName: "",
    contactEmail: "",
    contactPhone: "",
    maxBookings: 5,
  });
  const [msg, setMsg] = useState("");

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/booking");
      setBookings(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) setMsg("Access denied");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/services", newService);
      setNewService({
        title: "",
        category: CATEGORIES[0],
        providerName: "",
        contactEmail: "",
        contactPhone: "",
        maxBookings: 5,
      });
      setMsg("Service added");
      fetchServices();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  return (
    <div className="container">
      <Navbar role="admin" />
      <h2>Admin Panel</h2>
      {msg && <p className="msg">{msg}</p>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Add Service</h3>
        <form onSubmit={handleAddService}>
          <input
            placeholder="Title"
            value={newService.title}
            onChange={(e) => setNewService({ ...newService, title: e.target.value })}
            required
          />
          <select
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            placeholder="Provider Name"
            value={newService.providerName}
            onChange={(e) => setNewService({ ...newService, providerName: e.target.value })}
            required
          />
          <input
            placeholder="Contact Email"
            type="email"
            value={newService.contactEmail}
            onChange={(e) => setNewService({ ...newService, contactEmail: e.target.value })}
            required
          />
          <input
            placeholder="Contact Phone"
            value={newService.contactPhone}
            onChange={(e) => setNewService({ ...newService, contactPhone: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Max Bookings"
            value={newService.maxBookings}
            onChange={(e) => setNewService({ ...newService, maxBookings: +e.target.value })}
          />
          <button type="submit">Add Service</button>
        </form>
      </div>

      <h3>Services</h3>
      {services.map((s) => (
        <div key={s._id} className="card">
          <h4>{s.title}</h4>
          <p>Category: {s.category} | Provider: {s.providerName}</p>
          <p>Bookings: {s.currentBookings}/{s.maxBookings}</p>
        </div>
      ))}

      <h3>All Bookings</h3>
      {bookings.map((b) => (
        <div key={b._id} className="card">
          <p>User: {b.user?.name} ({b.user?.email})</p>
          <p>Service: {b.service?.title}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
