import { useState, useEffect } from "react";
import "./history.css";

import { BACKEND_URL } from './config';


function History({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/history?email=${user.email}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.email) {
      fetchHistory();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="history-container">
        <h2 className="history-title">Reservation History</h2>
        <p className="loading-text">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <h2 className="history-title">Reservation History</h2>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="history-title">Reservation History</h2>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <p>No reservations yet</p>
          <p className="empty-subtitle">Start ordering to see your history!</p>
        </div>
      ) : (
        <div className="history-list">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="history-card">
              <div className="history-card-header">
                <span className="stall-badge">Stall {reservation.stall}</span>
                <span className="price-badge">₱{reservation.price}</span>
              </div>

              <div className="history-card-body">
                <h3 className="ulam-name">{reservation.ulamName}</h3>
                <p className="rice-info">
                  {reservation.withRice ? "With Rice" : "Ulam Only"}
                </p>
              </div>

              <div className="history-card-footer">
                <span className="date-text">{formatDate(reservation.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;