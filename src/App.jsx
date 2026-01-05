
import './App.css'
import { useState, useEffect } from "react";



function Home({ goLogin }) {
  
  const foodImages = [
    "public/2.png",
    "public/3.png",
    "public/4.png",
    "public/5.png",
    
    "public/7.png",
    
    
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % foodImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="phone">
      <div className="home-top">
        <button className="login-btn" onClick={goLogin}>
          LOGIN / SIGNUP
        </button>
      </div>

      <div className="home-middle">
        <img
          src={foodImages[currentIndex]}
          alt="Food"
          className="food-image"
        />
      </div> 

      <div className="home-bottom">
  <div className="text-section">
    <h1>CVSU Cafeteria</h1>
    <p>EAT MORE, WORRY LESS</p>
  </div>

  <div className="logo-section">
    <img src="src/LOGO.png" alt="CVSU Cafeteria Logo" />
  </div>
</div>
    </div>
  )
}

/* ================= LOGIN ================= */
import SignupModal from "./SignupModal"
import MyAccount from './MyAccount';

function Login({ goBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await fetch("http://192.168.18.3:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
  // ✅ SAVE USER FOR EATERIES & REFRESH
  localStorage.setItem("user", JSON.stringify(data.user));

  onLoginSuccess(data.user);
}if (res.ok) {
        // Login successful
        onLoginSuccess(data.user);
      } else if (data && data.message) {
        // Server returned an error message
        alert(data.message);
      } else {
        alert("Unknown error occurred");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Cannot reach server. Please check backend.");
    }
  };

  return (
    <div className="phone">
      <div className="login-header">
        <div className="brand">
          <div>
            <h1>CVSU Cafeteria</h1>
            <p>EAT MORE, WORRY LESS</p>
          </div>
          <img src="src/LOGO.png" alt="CVSU Logo" />
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <h2>LOGIN</h2>

          <label>CVSU EMAIL:</label>
          <input
            placeholder="e.g., name@cvsu.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>PASSWORD:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-submit" onClick={handleLogin}>
            LOGIN
          </button>

          <button className="signup-submit" onClick={() => setShowSignup(true)}>
            SIGN-UP
          </button>

          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
        </div>
      </div>

      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
    </div>
  );
}


function Tabs({ setPage }) {
  return (
    <div className="tabs">
      <button onClick={() => setPage('eateries')}>EATERIES</button>
      <button onClick={() => setPage('pinggang')}>PINGGANG PINOY</button>
      <button onClick={() => setPage('about')}>ABOUT US</button>
    </div>
  )
}
/* ================= CAFETERIA UI ================= */
function Navbar({ setPage, onLogout }) {
  const [open, setOpen] = useState(false);

  const goTo = (page) => {
    setPage(page);
    setOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="nav">
        <div className="menu-icon" onClick={() => setOpen(!open)}>
          <img className="menu-icon" src="public/menu.png"  />
        
        </div>

        <div className="nav-logo">
          <h1>CVSU Cafeteria</h1>
          <p>EAT MORE, WORRY LESS</p>
        </div>

        <img src="src/LOGO.png" className="nav-img" alt="Logo" />
      </div>

      {/* Side Menu */}
      {open && (
        <div className="side-menu">
          <ul>
            <li>
              <button className="menu-icon" onClick={() => goTo("eateries")}>
            
               <img className="menu-icon" src="public/menu.png"  />
              </button>
            </li>
            <li>
              <button onClick={() => goTo("eateries")}>
                EATERIES
              </button>
            </li>

            <li>
              <button onClick={() => goTo("account")}>
                MY ACCOUNT
              </button>
            </li>

            <li>
              <button onClick={() => goTo("pinggang")}>
                PINGGANG PINOY
              </button>
            </li>

            <li>
              <button onClick={() => goTo("ulam")}>
                ULAM OF THE DAY
              </button>
            </li>

            <li>
              <button onClick={() => goTo("about")}>
                ABOUT US
              </button>
            </li>

            <li>
              <button
                className="logout-btn"
                onClick={() => {
                  onLogout();     // 🔥 App.handleLogout
                  setOpen(false);
                }}
              >
                LOG OUT
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}


import Reserve from "./Reserve"; // new component
import "./reserve.css";

const BACKEND_URL = "http://192.168.18.3:5000";

function Eateries({ user: userProp }) {
  const [user] = useState(() => {
    if (userProp) return userProp;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [activeStall, setActiveStall] = useState(null);
  const [ulams, setUlams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUlam, setSelectedUlam] = useState(null);

  if (!user) return <p>Please login first</p>;

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

  // ✅ CHANGED: Images now load from frontend public folder
 const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return `${BACKEND_URL}${imagePath}`;
};
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="content">
      {/* ===== STALL SELECT ===== */}
      {activeStall === null && (
        <>
          <h2 className="title_EATERIES">Eateries</h2>
          <div className="stall-grid">
            <div className="stall" onClick={() => setActiveStall(1)}>STALL 1</div>
            <div className="stall" onClick={() => setActiveStall(2)}>STALL 2</div>
          </div>
        </>
      )}

      {[1, 2,3].map((stallNum) => {
        if (activeStall !== stallNum) return null;
        const stallUlams = ulams.filter((u) => Number(u.stall) === stallNum);
        const ulamOfToday = stallUlams.find((u) => u.isUlamOfTheDay) || stallUlams[0];

        return (
          <div key={stallNum} className="stall-container">
            <h3 className="ulam-today-title">ULAM OF THE DAY</h3>

            <div className="stall-header">
              <h1>Stall {stallNum}</h1>
            </div>

            {ulamOfToday && <div className="ulam-today-banner">ULAM OF THE DAY</div>}

            <div className="ulam-grid">
              {stallUlams.map((u) => (
                <div
                  key={u.id}
                  className={`ulam-card ${u === ulamOfToday ? "featured" : ""}`}
                  onClick={() => setSelectedUlam(u)}
                >
                  {u === ulamOfToday && <span className="star">★</span>}
                  <img src={getImageUrl(u.image)} alt={u.name} />
                  <span className="ulam-name">{u.name}</span>
                </div>
              ))}
            </div>

            <button className="bb" onClick={() => setActiveStall(null)}>← Back</button>
          </div>
        );
      })}

      {selectedUlam && (
        <Reserve
          user={user}
          ulam={selectedUlam}
          activeStall={activeStall}
          onClose={() => setSelectedUlam(null)}
        />
      )}
    </div>
  );
}

function Pinggang() {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="pinggang-container">
      <h1 className="pinggang-title">Pinggang Pinoy</h1>

      {/* SAME DIV – content changes */}
      <div className="pinggang-box">
        {!showDesc ? (
          <img
            src="src/Pinggang.png"
            alt="Pinggang Pinoy Guide"
            onClick={() => setShowDesc(true)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div className="pinggang-content">
  <p>
    <strong>Pinggang Pinoy</strong>, developed by the FNRI with the WHO, DOH, and NNC,
    promotes balanced meals with the right mix of <strong>Go, Grow, and Glow</strong> foods.
    It helps Filipinos make healthier food choices, control portions, and build habits
    that support overall well-being.
  </p>

  <ul>
    <li>
      <span className="label go">Go foods:</span>
      Give energy for school and play – like rice, bread, and pasta.
    </li>
    <li>
      <span className="label grow">Grow foods:</span>
      Build strong muscles and body – like meat, fish, eggs, and milk.
    </li>
    <li>
      <span className="label glow">Glow foods:</span>
      Keep skin, hair, and eyes healthy – like fruits and vegetables.
    </li>
  </ul>
</div>
        )}
      </div>
    </div>
  );
}
function About() {
  const [page, setPage] = useState(0);

  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>

      {/* SAME DIV – content changes */}
      <div className="about-box">

        {page === 0 && (
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              We know how frustrating it can be to spend half your lunch break
              waiting in line for food. That’s why we built the Smart Canteen
              Management System — a faster, smarter way to enjoy your meals.
            </p>
            <p>
              Powered by Machine Learning and IoT, our system helps students
              order easily, skip long queues, and get food on time.
            </p>
          </div>
        )}

        {page === 1 && (
          <div className="about-content">
            <h2>Eat More, Worry Less</h2>
            <p>
              Enjoy your favorite meals without the stress of long lines.
              Our Smart Canteen System makes ordering faster and easier
              for everyone.
            </p>
            <p>
              With just a few taps, your food is ready when you are.
            </p>
          </div>
        )}

       {page === 2 && (
  <section className="about">
    <h2 class="founders-title">The Founders</h2>
    <ul className="founders">
      <li>
        <img src="public/k.png" alt="Kheneth Sorbito" />
        <p>Kheneth Sorbito</p>
      </li>
      <li>
        <img src="public/m.png" alt="Marinelle Facundo" />
        <p>Marinelle Facundo</p>
      </li>
      <li>
        <img src="public/D.png" alt="Denver Risma" />
        <p>Denver Risma</p>
      </li>
    </ul>
  </section>
)}



        {/* Navigation (same box) */}
        <div className="about-nav">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Back
          </button>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === 2}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
function Cafeteria({ user, onLogout }) {
  const [tab, setTab] = useState("eateries");

  return (
    <div className="phone">
      <Navbar setPage={setTab} onLogout={onLogout} />
      <Tabs setPage={setTab} />

      {/* ✅ PASS USER HERE */}
      {tab === "eateries" && <Eateries user={user} />}

      {tab === "pinggang" && <Pinggang setPage={setTab} />}
      {tab === "about" && <About />}

      {tab === "account" && (
        <MyAccount userProp={user} onLogout={onLogout} />
      )}
    </div>
  );
}



/* ================= APP CONTROLLER ================= */

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("cafeteria");
  };

  const handleLogout = () => {
  localStorage.removeItem("user");
  setUser(null);
  setPage("home");
};

  return (
    <>
      {page === "home" && <Home goLogin={() => setPage("login")} />}

      {page === "login" && (
        <Login
          goBack={() => setPage("home")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {page === "cafeteria" && (
        <Cafeteria user={user} onLogout={handleLogout} />
      )}
    </>
  );
}