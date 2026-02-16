import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

interface Service {
  _id: string;
  title: string;
  category: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
}

interface Booking {
  _id: string;
  service: Service;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const role = localStorage.getItem("role") || "customer";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/booking/my");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="container">
      <Navbar role={role} />
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id} className="card">
            <h4>{b.service?.title}</h4>
            <p>Category: {b.service?.category}</p>
            <p>Provider: {b.service?.providerName}</p>
            <p>Contact: {b.service?.contactEmail} | {b.service?.contactPhone}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
