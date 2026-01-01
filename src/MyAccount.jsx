import { useEffect, useState, useCallback } from "react";
import "./account.css";
function MyAccount({ onLogout, userProp }) {
  const [user, setUser] = useState(userProp || null);
  const [loading, setLoading] = useState(!userProp);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userProp) {
      setUser(userProp);
      setLoading(false);
      return;
    }

    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("No user logged in");
      setLoading(false);
      return;
    }

    const fetchAccount = async () => {
      try {
        const res = await fetch(`http://localhost:5000/account?email=${email}`);
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned invalid JSON");
        }

        if (!res.ok) throw new Error(data.message || "Failed to fetch account");
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [userProp]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    onLogout();
  };

  if (loading) return <p>Loading account info...</p>;

  return (
    <div className="account-container">
      <h2>MY ACCOUNT</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {user && (
        <div className="account-card">
          <p><strong>CVSU ACCOUNT:</strong> {user?.email || "N/A"}</p>
          <p><strong>FIRST NAME:</strong> {user?.firstName || "N/A"}</p>
          <p><strong>LAST NAME:</strong> {user?.lastName || "N/A"}</p>
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}

export default MyAccount;

