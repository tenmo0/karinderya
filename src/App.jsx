
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
          LOGIN / SIGN-UP
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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showSignup, setShowSignup] = useState(false)

  
const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password")
    return
  }

  try {
    const res = await fetch("http://192.168.18.3:5000/login", {  // <- IP here
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) { // check HTTP status
      onLoginSuccess(data.user)
    } else {
      alert(data.message)
    }
  } catch (err) {
    console.error(err)
    alert("Server error")
  }
}

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
          <h2>LOGIN / SIGN-UP</h2>

          <label>CVSU EMAIL:</label>
          <input
            placeholder="e.g., name@cvsu.edu.ph"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label>PASSWORD:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {/* LOGIN */}
          <button className="login-submit" onClick={handleLogin}>
            LOGIN
          </button>

          {/* OPEN SIGN-UP MODAL */}
          <button className="signup-submit" onClick={() => setShowSignup(true)}>
            SIGN-UP
          </button>

          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
        </div>
      </div>

      {/* Show Signup Modal */}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
    </div>
  )
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
function Navbar({ setPage }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="nav">
        <div className="menu-icon" onClick={() => setOpen(!open)}>
          ☰
        </div>

        <div className="nav-logo">
          <h1>CVSU Cafeteria</h1>
          <p>EAT MORE, WORRY LESS</p>
        </div>

        <img src="src/LOGO.png" className="nav-img" />
      </div>

      {open && (
  <div className="side-menu">
    <ul>
      <li>
        <button onClick={() => {
          setPage("eateries");
          setOpen(false);
        }}>
        <div className="menu-icon" onClick={() => setOpen(!open)}>
          ☰
        </div>
       </button>
      </li>
      <li>
        <button onClick={() => {
          setPage("faves");
          setOpen(false);
        }}>
          ALL TIME FAVES
        </button>
      </li>

      <li>
       <button onClick={() => {setPage("account");setOpen(false);}}>
  MY ACCOUNT
</button>
      </li>

      <li>
        <button onClick={() => {
          setPage('pinggang');
          setOpen(false);
        }}>
          PINGGANG PINOY
        </button>
      </li>

      <li>
        <button onClick={() => {
          setPage("ulam");
          setOpen(false);
        }}>
          ULAM OF THE DAY
        </button>
      </li>

      <li>
        <button onClick={() => {
          setPage("about");
          setOpen(false);
        }}>
          ABOUT US
        </button>
      </li>
<li>
  <button
    onClick={() => {
      setOpen(false);   // close menu
             // 🔥 logout (App → Cafeteria → MyAccount)
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

function Eateries() {
  return (
    <div className="content">
      <h2 className="title_EATERIES">Eateries</h2>
      <div className="stall-grid">
        <div className="stall">STALL 1</div>
        <div className="stall">STALL 2</div>
        <div className="stall">STALL 3</div>
        <div className="stall">STALL 4</div>
       
      </div>
    </div>
  )
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
            src="src\Pinggang.png"
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

      {tab === "eateries" && <Eateries />}
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
    localStorage.setItem("userEmail", loggedInUser.email);
    setPage("cafeteria");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userEmail");
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
        <Cafeteria
          user={user}
          onLogout={handleLogout}  
        />
      )}
    </>
  );
}
