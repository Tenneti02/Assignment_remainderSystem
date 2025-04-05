import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const validateInputs = () => {
    // Password must be at least 6 characters (Firebase requirement) and contain a number
    const passwordRegex = /^(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 characters and include a number.");
      return false;
    }

    // Basic phone number validation (e.g., +1234567890 or 123-456-7890)
    const phoneRegex = /^\+?\d{1,4}[-.\s]?\d{6,12}$/;
    if (phone && !phoneRegex.test(phone)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Start loading

    // Trim inputs to remove unwanted whitespace
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      const userDetails = { email: trimmedEmail, phoneNumber: trimmedPhone || null }; // Store null if phone is empty
      await setDoc(doc(db, "users", user.uid), userDetails);

      // Check if more details are needed
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().collegeName) {
        navigate("/profile");
      } else {
        navigate("/user-details");
      }
    } catch (error) {
      setError("Registration failed: " + error.message);
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="form-group" noValidate>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-describedby="email-error"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-describedby="password-error"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            type="tel"
            id="phone"
            placeholder="Phone (e.g., +1234567890)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-describedby="phone-error"
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;