import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    if (savedMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <div className="home-container">
      <button className="toggle-dark-mode" onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <h1>Welcome to RemzUp</h1>
      <p>Stay on top of your assignments with ease!</p>
      <div className="home-buttons">
        <Link to="/login" className="btn-primary">Login</Link>
        <Link to="/register" className="btn-secondary">Register</Link>
      </div>
    </div>
  );
}

export default Home;