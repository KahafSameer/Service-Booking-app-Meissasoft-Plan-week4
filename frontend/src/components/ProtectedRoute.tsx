import {Navigate } from 'react-router-dom';

type props = {
  children: JSX.Element;
};
export default function ProtectedRoute({ children }: props) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
}