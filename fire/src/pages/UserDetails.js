import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function UserDetails() {
  const [collegeName, setCollegeName] = useState("");
  const [education, setEducation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const validateInputs = () => {
    // Phone number validation (optional, but must be valid if provided)
    const phoneRegex = /^\+?\d{1,4}[-.\s]?\d{6,12}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (e.g., +918919630782).");
      return false;
    }

    // Semester validation (must be a number between 1 and 12)
    const semesterNum = parseInt(semester, 10);
    if (!semester || isNaN(semesterNum) || semesterNum < 1 || semesterNum > 12) {
      setError("Semester must be a number between 1 and 12.");
      return false;
    }

    // College name and education must not be empty
    if (!collegeName.trim() || !education.trim()) {
      setError("College Name and Education are required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Start loading

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("No authenticated user found.");
      setLoading(false);
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        collegeName: collegeName.trim(),
        education: education.trim(),
        phoneNumber: phoneNumber.trim() || null, // Store null if empty
        semester: semester.trim(),
        email: user.email,
      });
      navigate("/profile");
    } catch (err) {
      setError("Failed to save details: " + err.message);
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container">
      <h2>User Details</h2>
      <form onSubmit={handleSubmit} className="form-group" noValidate>
        <div className="input-group">
          <label htmlFor="college-name">College Name</label>
          <input
            type="text"
            id="college-name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="College Name"
            required
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="education">Education</label>
          <input
            type="text"
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Education (e.g., B.Tech)"
            required
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="phone-number">Phone Number (optional)</label>
          <input
            type="tel"
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number (e.g., +918919630782)"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="semester">Semester</label>
          <input
            type="text"
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="Semester (e.g., 3)"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default UserDetails;