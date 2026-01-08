import { useState } from "react"
import './sig.css'

import { BACKEND_URL } from './config';

function SignupModal({ close }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      alert("All fields are required")
      return
    }

    // CVSU email validation
    if (!email.endsWith("@cvsu.edu.ph")) {
      alert("Email must be a CVSU account")
      return
    }

    // Password length check
    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password })
      })

      const data = await res.json()
      alert(data.message)

      if (data.message === "Signup successful") {
        close()
      }
    } catch (err) {
      alert("Server error")
    }
  }

  return (
    <div className="signup-modal fade-in">
      <div className="signup-card">
        <h2>Sign Up</h2>

        <label>First Name:</label>
        <input
          placeholder="Enter first name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />

        <label>Last Name:</label>
        <input
          placeholder="Enter last name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />

        <label>CVSU Email:</label>
        <input
          placeholder="name@cvsu.edu.ph"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="signup-buttons">
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default SignupModal
