import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

const CATEGORIES = [
  "DevOps", "DevSecOps", "MLOps", "Cloud Infrastructure",
  "CI/CD Automation", "Containerization", "Kubernetes Management",
  "Monitoring & Logging", "Security & Compliance"
];

interface Service {
  id: number;
  title: string;
  category: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
  currentBookings: number;
  maxBookings: number;
  available: boolean;
}

interface Booking {
  id: number;
  user: { id: number; name: string; email: string; role?: string };
  service: Service;
  createdAt: string;
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
  const [editing, setEditing] = useState<Service | null>(null);
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
    setMsg("");
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

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setMsg("");
    try {
      await api.put(`/services/${editing.id}`, editing);
      setMsg("Service updated");
      setEditing(null);
      fetchServices();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    setMsg("");
    try {
      await api.delete(`/services/${id}`);
      setMsg("Service deleted");
      fetchServices();
      fetchBookings();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Delete failed");
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
      {msg && <p className={`msg ${msg.includes("added") || msg.includes("updated") || msg.includes("deleted") ? "success" : "error"}`}>{msg}</p>}

      <div className="card add-form">
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
            min={1}
            value={newService.maxBookings}
            onChange={(e) => setNewService({ ...newService, maxBookings: +e.target.value })}
          />
          <button type="submit" className="btn-primary">Add Service</button>
        </form>
      </div>

      {editing && (
        <div className="card add-form overlay-form">
          <h3>Edit Service</h3>
          <form onSubmit={handleUpdateService}>
            <input
              placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Provider Name"
              value={editing.providerName}
              onChange={(e) => setEditing({ ...editing, providerName: e.target.value })}
              required
            />
            <input
              placeholder="Contact Email"
              type="email"
              value={editing.contactEmail}
              onChange={(e) => setEditing({ ...editing, contactEmail: e.target.value })}
              required
            />
            <input
              placeholder="Contact Phone"
              value={editing.contactPhone}
              onChange={(e) => setEditing({ ...editing, contactPhone: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Max Bookings"
              min={1}
              value={editing.maxBookings}
              onChange={(e) => setEditing({ ...editing, maxBookings: +e.target.value })}
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <h3>Services</h3>
      {services.length === 0 ? (
        <p>No services yet. Add one above.</p>
      ) : (
        <div className="card-grid">
          {services.map((s) => (
            <div key={s.id} className="card">
              <h4>{s.title}</h4>
              <p className="meta">Category: {s.category} | Provider: {s.providerName}</p>
              <p className="slots">Bookings: {s.currentBookings}/{s.maxBookings}</p>
              <div className="card-actions">
                <button className="btn-small" onClick={() => setEditing(s)}>Edit</button>
                <button className="btn-small btn-danger" onClick={() => handleDeleteService(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>All Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="card-grid">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <p><strong>User:</strong> {b.user?.name} ({b.user?.email})</p>
              <p><strong>Service:</strong> {b.service?.title}</p>
              <p className="meta">{new Date(b.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
