import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000

export const bookService = async (serviceId: string, token: string) => {
    return await axios.post(
        `${BASE_URL}/bookings/${serviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const getMyBookings = async (token: string) => {
    return await axios.get(`${BASE_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getAllBookings = async (token: string) => {
    return await axios.get(`${BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
