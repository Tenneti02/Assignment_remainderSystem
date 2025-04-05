import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format check
    return emailRegex.test(email.trim());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true); // Start loading

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/profile"); // Always go to profile, let it decide
    } catch (error) {
      setMessage("Login failed: " + error.message);
      setTimeout(() => setMessage(""), 5000); // Clear message after 5 seconds
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!resetEmail) {
      setMessage("Please enter your email.");
      return;
    }
    if (!validateEmail(resetEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true); // Start loading

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => setMessage(""), 5000); // Clear success message after 5 seconds
      setResetEmail(""); // Clear reset email input
    } catch (error) {
      setMessage("Failed to send reset email: " + error.message);
      setTimeout(() => setMessage(""), 5000); // Clear error message after 5 seconds
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="form-group" noValidate>
        <div className="input-group">
          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-describedby="login-error"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-describedby="login-error"
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="forgot-password">
        <h4>Forgot Password?</h4>
        <form onSubmit={handleForgotPassword} className="form-group" noValidate>
          <div className="input-group">
            <label htmlFor="reset-email">Email</label>
            <input
              type="email"
              id="reset-email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              aria-describedby="reset-error"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-secondary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        {message && (
          <p
            className={message.includes("sent") ? "success" : "error"}
            role="alert"
          >
            {message}
          </p>
        )}
      </div>

      <p className="register-link">
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;