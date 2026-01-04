import { useState } from "react";
import "./reserve.css";

const BACKEND_URL = "http://192.168.18.3:5000";

function Reserve({ user, ulam, activeStall, onClose }) {
  const [withRice, setWithRice] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [reserveData, setReserveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReserve = async () => {
    if (!activeStall || !ulam || !user) {
      setError("Missing data. Please ensure you are logged in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stall: activeStall,
          ulamId: ulam.id,
          withRice,
          userEmail: user.email,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server sent HTML instead of JSON. Check Console (F12).`);
      }

      if (!response.ok) throw new Error(data.message || "Error during reservation");

      setReserveData(data.reservation);
      setReserved(true);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ulam-modal-overlay"><p style={{color: "white"}}>Processing...</p></div>;

  if (reserved && reserveData) {
    return (
      <div className="reserve-success-container">
        <div className="reserve-success-card fade-in">
          <h1>Successfully Reserved!</h1>
          <p>CLAIM AT STALL {reserveData.stall}</p>
          <p>CUSTOMER: {reserveData.userName.toUpperCase()}</p>
          <p>TOTAL: ₱{reserveData.price}</p>
          <button className="reserve-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ulam-modal-overlay fade-in" onClick={onClose}>
      <div className="ulam-modal" onClick={(e) => e.stopPropagation()}>
        {error && <div className="error-banner">{error}</div>}
        
        <img 
          src={`${BACKEND_URL}${ulam.image}`} 
          alt={ulam.name} 
          onError={(e) => e.target.src = "https://via.placeholder.com/150"} 
        />
        
        <h2>{ulam.name}</h2>

        <div className="ulam-info">
          {/* --- DESCRIPTION SECTION --- */}
          <h4>DESCRIPTION:</h4>
          <p className="description-text">
            {ulam.description || "No description available for this dish."}
          </p>

          {/* --- INGREDIENTS SECTION --- */}
          <h4>INGREDIENTS:</h4>
          <p>{ulam.ingredients?.length ? ulam.ingredients.join(", ") : "Not specified"}</p>
          
          {/* --- ALLERGENS SECTION --- */}
          <h4>ALLERGENS:</h4>
          <p className="allergen-text" style={{ color: ulam.allergens?.length ? "#d32f2f" : "inherit" }}>
            {ulam.allergens?.length ? ulam.allergens.join(", ") : "None"}
          </p>
        </div>

        <div className="rice-options">
          <button onClick={() => setWithRice(false)} className={!withRice ? "active" : ""}>
            Ulam Only
          </button>
          <button onClick={() => setWithRice(true)} className={withRice ? "active" : ""}>
            With Rice
          </button>
        </div>

        <p className="price">₱{withRice ? ulam.withRicePrice : ulam.ulamOnlyPrice}</p>

        <div className="reserve-buttons">
          <button className="reserve-btn" onClick={handleReserve}>
            RESERVE NOW
          </button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Reserve;