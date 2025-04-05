import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

Modal.setAppElement("#root");

function Profile() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchUserDetails = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
          console.log("Fetched userDetails:", userDoc.data());
          if (!userDoc.data().collegeName) {
            navigate("/user-details");
          }
        } else {
          navigate("/user-details");
        }
      };

      const fetchAssignments = async () => {
        const assignmentsCol = collection(db, "users", user.uid, "assignments");
        const assignmentsSnapshot = await getDocs(assignmentsCol);
        const assignmentsList = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssignments(assignmentsList);
        checkDueDates(assignmentsList);
      };

      fetchUserDetails();
      fetchAssignments();
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const saveAssignments = async (newAssignments) => {
    const user = auth.currentUser;
    if (user) {
      const assignmentsCol = collection(db, "users", user.uid, "assignments");
      for (const assignment of newAssignments) {
        await setDoc(doc(assignmentsCol, assignment.id), {
          title: assignment.title,
          dueDate: assignment.dueDate,
          completed: assignment.completed,
          createdAt: assignment.createdAt,
        });
      }
      console.log("Saved assignments to Firestore:", newAssignments);
    }
  };

  useEffect(() => {
    if (assignments.length > 0) {
      saveAssignments(assignments);
      checkDueDates(assignments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!title || !dueDate || !dueTime) {
      setNotification("Please enter a title, due date, and time.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const dueDateTime = new Date(`${dueDate}T${dueTime}`).toISOString();
    const newAssignment = {
      id: Date.now().toString(),
      title,
      dueDate: dueDateTime,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setIsAddModalOpen(false);
  };

  const handleDeleteAssignment = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
    }
  };

  const handleToggleComplete = (id, currentStatus) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id ? { ...assignment, completed: !currentStatus } : assignment
      )
    );
  };

  const handleSort = () => {
    setAssignments((prev) =>
      [...prev].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    );
  };

  const sendEmailReminder = (assignment) => {
    const user = auth.currentUser;
    const emailToSend = userDetails?.email || user?.email;
    console.log("Sending email to:", emailToSend);
    const dueDateFormatted = new Date(assignment.dueDate).toLocaleString([], {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const templateParams = {
      title: assignment.title,
      dueDate: dueDateFormatted,
      to_email: emailToSend,
    };

    emailjs
      .send(
        "service_x1kxmuh",
        "template_m7qm1i9",
        templateParams,
        "Br_yFh6Yyjrw2OvLA"
      )
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setNotification(`Email reminder sent for "${assignment.title}"!`);
        setTimeout(() => setNotification(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to send email:", err);
        setNotification("Failed to send email reminder: " + err.text);
        setTimeout(() => setNotification(""), 3000);
      });
  };

  const checkDueDates = (assignmentList) => {
    const now = new Date();
    assignmentList.forEach((assignment) => {
      const dueDate = new Date(assignment.dueDate);
      const timeDiff = dueDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff > 0 && hoursDiff <= 24 && !assignment.completed) {
        const timeString = dueDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setNotification(`"${assignment.title}" is due tomorrow at ${timeString}!`);
        setTimeout(() => setNotification(""), 5000);
        sendEmailReminder(assignment);
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setNotification("Failed to log out: " + error.message);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  };

  return (
    <div className="container">
      {userDetails && (
        <div className="user-details">
          <h3>Your Details</h3>
          <p><strong>College:</strong> {userDetails.collegeName}</p>
          <p><strong>Education:</strong> {userDetails.education}</p>
          <p><strong>Phone:</strong> {userDetails.phoneNumber}</p>
          <p><strong>Semester:</strong> {userDetails.semester}</p>
        </div>
      )}

      <div className="assignments-section">
        <h2>Your Assignments</h2>
        <div className="form-group">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            Add Assignment
          </button>
          <button className="btn-secondary" onClick={handleSort}>
            Sort by Due Date
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              sendEmailReminder({
                title: "Test Assignment",
                dueDate: new Date().toISOString(),
              })
            }
          >
            Test Email
          </button>
        </div>
        <ul className="assignment-list">
          {assignments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>No assignments yet.</p>
          ) : (
            assignments.map((assignment) => (
              <motion.li
                key={assignment.id}
                className={`assignment-item ${assignment.completed ? "completed" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={assignment.completed}
                  onChange={() => handleToggleComplete(assignment.id, assignment.completed)}
                />
                <span>
                  {assignment.title} - Due:{" "}
                  {new Date(assignment.dueDate).toLocaleString([], {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </motion.li>
            ))
          )}
        </ul>
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="modal-right"
        overlayClassName="modal-overlay-right"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <h3>Add New Assignment</h3>
          <form onSubmit={handleAddAssignment} className="form-group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment Title"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              required
            />
            <div className="form-group">
              <button type="submit" className="btn-primary">
                Add
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </Modal>

      {notification && (
        <motion.div
          className="notification"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {notification}
        </motion.div>
      )}
    </div>
  );
}

export default Profile;