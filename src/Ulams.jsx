import { useState, useEffect } from "react";
import { BACKEND_URL } from './config';
import Reserve from "./Reserve";
import "./ulams.css";

function ULAMS({ user: userProp }) {
  const [user] = useState(() => {
    if (userProp) return userProp;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [ulams, setUlams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUlam, setSelectedUlam] = useState(null);
  const [filterStall, setFilterStall] = useState("all");

  useEffect(() => {
    const fetchUlams = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/ulams`);
        if (!res.ok) throw new Error("Failed to fetch ulams");
        const data = await res.json();
        setUlams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUlams();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${BACKEND_URL}${imagePath}`;
  };

  if (!user) return <p>Please login first</p>;
  if (loading) return <p>Loading ulams...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  // Filter ulams based on selected stall
  const filteredUlams = filterStall === "all" 
    ? ulams 
    : ulams.filter(u => Number(u.stall) === filterStall);

  return (
    <div className="ulams-page">
      <h1 className="ulams-title">All Ulams</h1>

      {/* Filter Buttons */}
      <div className="stall-filters">
        <button 
          className={filterStall === "all" ? "active" : ""}
          onClick={() => setFilterStall("all")}
        >
          All Stalls
        </button>
        <button 
          className={filterStall === 1 ? "active" : ""}
          onClick={() => setFilterStall(1)}
        >
          Stall 1
        </button>
        <button 
          className={filterStall === 2 ? "active" : ""}
          onClick={() => setFilterStall(2)}
        >
          Stall 2
        </button>
      </div>

      {/* Grid with Detailed Cards */}
      <div className="ulams-simple-grid">
        {filteredUlams.map((ulam) => (
          <div 
            key={ulam.id} 
            className={`ulam-circle-card ${ulam.isUlamOfTheDay ? "featured" : ""}`}
            onClick={() => setSelectedUlam(ulam)}
          >
            {ulam.isUlamOfTheDay && (
              <div className="star-badge">ULAM OF THE DAY</div>
            )}
            <div className="ulam-image-circle">
              <img src={getImageUrl(ulam.image)} alt={ulam.name} />
            </div>
            <div className="ulam-info">
              <h3 className="ulam-name">{ulam.name}</h3>
              <p className="ulam-desc">{ulam.description}</p>
              <div className="ulam-prices">
                <span>Ulam Only: ₱{ulam.ulamOnlyPrice}</span>
                <span>With Rice: ₱{ulam.withRicePrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reserve Modal */}
      {selectedUlam && (
        <Reserve
          user={user}
          ulam={selectedUlam}
          activeStall={selectedUlam.stall}
          onClose={() => setSelectedUlam(null)}
        />
      )}
    </div>
  );
}

export default ULAMS;