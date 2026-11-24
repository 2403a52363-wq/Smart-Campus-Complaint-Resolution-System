
import React, { useState, useEffect } from "react";

function App() {
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Hostel");
  const [priority, setPriority] = useState("Medium");

  const [myComplaints, setMyComplaints] = useState([]);
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");

  const [staffComplaintId, setStaffComplaintId] = useState("");
  const [staffStatus, setStaffStatus] = useState("In Progress");

  const [allComplaints, setAllComplaints] = useState([]);

  const [assignComplaintId, setAssignComplaintId] = useState("");
  const [assignStaffId, setAssignStaffId] = useState("");

  useEffect(() => {
    if (!loggedInUser || loggedInUser.role.toLowerCase() !== "student") {
      return;
    }

    fetch(`https://smart-campus-backend-4ugy.onrender.com/complaints/${loggedInUser.user_id}`)
      .then((response) => response.json())
      .then((data) => setMyComplaints(data))
      .catch((error) => console.log("Error loading complaints:", error));
  }, [loggedInUser]);

  const logout = () => {
    setLoggedInUser(null);
    setMyComplaints([]);
    setEmail("");
    setPassword("");
    setSelectedRole("");
    setStaffComplaintId("");
    setStaffStatus("In Progress");
  };

  const roles = [
    {
      name: "Student",
      icon: "🎓",
      desc: "Submit complaints and track their progress.",
      color: "#6256e8"
    },
    {
      name: "Staff",
      icon: "🧑‍💼",
      desc: "Manage assigned complaints and update status.",
      color: "#0d9488"
    },
    {
      name: "Admin",
      icon: "🛡️",
      desc: "Manage users, assign and monitor complaints.",
      color: "#e58b32"
    }
  ];

  // STAFF DASHBOARD
  if (loggedInUser && loggedInUser.role.toLowerCase() === "staff") {
    return (
      <div style={{
        minHeight: "100vh",
        padding: "35px 5%",
        background: "linear-gradient(135deg, #e0f2fe, #ecfdf5)",
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <style>{`
          * { box-sizing: border-box; }
          .staff-input {
            display: block;
            width: 100%;
            padding: 14px;
            margin: 15px 0;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-size: 15px;
          }
          .staff-button {
            width: 100%;
            padding: 14px;
            background: #0d9488;
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
          }
          .staff-logout {
            margin-top: 25px;
            padding: 13px 30px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
          }
        `}</style>

        <div style={{
          maxWidth: "1100px",
          margin: "auto",
          padding: "30px",
          borderRadius: "20px",
          color: "white",
          background: "linear-gradient(120deg, #064e3b, #0d9488)",
          boxShadow: "0 10px 30px #064e3b33"
        }}>
          <h1>SmartCampus Staff Portal</h1>
          <p style={{ marginTop: "10px" }}>
            Welcome, {loggedInUser.full_name}!
          </p>
        </div>

        <div style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "30px",
          background: "white",
          borderRadius: "18px",
          boxShadow: "0 6px 22px #00000012"
        }}>
          <h2 style={{ color: "#0d9488", marginBottom: "20px" }}>
            Staff Dashboard
          </h2>

          <div style={{
            padding: "22px",
            background: "#f0fdfa",
            borderRadius: "14px"
          }}>
            <h3>📋 Complaint Status Management</h3>

            <p style={{ color: "#777", marginTop: "10px" }}>
              Enter a complaint ID and update its current status.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();

              try {
                const response = await fetch(
                  `https://smart-campus-backend-4ugy.onrender.com/complaints/${staffComplaintId}/status`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      status: staffStatus
                    })
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.detail || "Status update failed");
                  return;
                }

                alert("Complaint status updated successfully!");
                setStaffComplaintId("");

              } catch (error) {
                alert("Backend connection failed!");
              }
            }}>
              <input
                className="staff-input"
                type="number"
                min="1"
                value={staffComplaintId}
                onChange={(e) => setStaffComplaintId(e.target.value)}
                placeholder="Enter Complaint ID"
                required
              />

              <select
                className="staff-input"
                value={staffStatus}
                onChange={(e) => setStaffStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button type="submit" className="staff-button">
                Update Complaint Status
              </button>
            </form>
          </div>

          <button className="staff-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD

  // ADMIN DASHBOARD
  if (loggedInUser && loggedInUser.role.toLowerCase() === "admin") {
    return (
      <div style={{
        minHeight: "100vh",
        padding: "35px 5%",
        background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "auto",
          padding: "30px",
          borderRadius: "20px",
          color: "white",
          background: "linear-gradient(120deg, #9a3412, #e58b32)"
        }}>
          <h1>SmartCampus Admin Portal</h1>
          <p>Welcome, {loggedInUser.full_name}!</p>
        </div>

        <div style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "30px",
          background: "white",
          borderRadius: "18px"
        }}>
          <h2>Admin Dashboard</h2>

          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  "https://smart-campus-backend-4ugy.onrender.com/admin/complaints",
                  {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${loggedInUser.access_token}`,
                      "Content-Type": "application/json"
                    }
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.detail || "Unable to load complaints");
                  return;
                }

                setAllComplaints(Array.isArray(data) ? data : []);

                if (Array.isArray(data) && data.length === 0) {
                  alert("No complaints found.");
                }
              } catch (error) {
                alert("Backend connection failed!");
              }
            }}
            style={{
              marginTop: "20px",
              padding: "13px 22px",
              background: "#e58b32",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            View All Complaints
          </button>

          {/* ASSIGN COMPLAINT TO STAFF */}
          <div style={{
            marginTop: "25px",
            padding: "22px",
            background: "#fff7ed",
            borderRadius: "14px",
            border: "1px solid #fed7aa"
          }}>
            <h3 style={{ marginBottom: "12px" }}>
              Assign Complaint to Staff
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();

              try {
                const response = await fetch(
                  "https://smart-campus-backend-4ugy.onrender.com/admin/assign",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${loggedInUser.access_token}`
                    },
                    body: JSON.stringify({
                      complaint_id: Number(assignComplaintId),
                      staff_id: Number(assignStaffId),
                      assigned_by: loggedInUser.user_id
                    })
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.detail || "Complaint assignment failed");
                  return;
                }

                alert("Complaint assigned successfully!");
                setAssignComplaintId("");
                setAssignStaffId("");

              } catch (error) {
                alert("Backend connection failed!");
              }
            }}>
              <input
                type="number"
                min="1"
                value={assignComplaintId}
                onChange={(e) => setAssignComplaintId(e.target.value)}
                placeholder="Enter Complaint ID"
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px",
                  margin: "12px 0",
                  border: "1px solid #ddd",
                  borderRadius: "9px"
                }}
              />

              <input
                type="number"
                min="1"
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                placeholder="Enter Staff User ID"
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px",
                  margin: "12px 0",
                  border: "1px solid #ddd",
                  borderRadius: "9px"
                }}
              />

              <button
                type="submit"
                style={{
                  padding: "13px 22px",
                  background: "#9a3412",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "pointer"
                }}
              >
                Assign Complaint
              </button>
            </form>
          </div>

          <h3 style={{ marginTop: "30px" }}>
            Complaint Records
          </h3>

          {allComplaints.length === 0 ? (
            <p style={{ marginTop: "15px", color: "#777" }}>
              No complaints loaded. Click View All Complaints.
            </p>
          ) : (
            allComplaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                style={{
                  marginTop: "18px",
                  padding: "20px",
                  background: "#fff7ed",
                  borderRadius: "12px",
                  borderLeft: "5px solid #e58b32"
                }}
              >
                <h3>{complaint.title}</h3>
                <p>Complaint ID: {complaint.complaint_id}</p>
                <p>Student ID: {complaint.student_id}</p>
                <p>Description: {complaint.description}</p>
                <p>Category: {complaint.category}</p>
                <p>Priority: {complaint.priority}</p>
                <p>Status: <strong>{complaint.status}</strong></p>
              </div>
            ))
          )}

          <button
            onClick={logout}
            style={{
              marginTop: "30px",
              padding: "13px 30px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }


  // STUDENT DASHBOARD
  if (loggedInUser) {
    return (
      <div className="dashboard-app">
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f3f2ff;
            color: #25234a;
          }

          .dashboard-app {
            min-height: 100vh;
            background: linear-gradient(135deg, #eeedff, #f8f5ff, #eaf5ff);
            padding: 35px 0;
          }

          .dashboard-header {
            width: 90%;
            max-width: 1150px;
            margin: 0 auto 30px;
            padding: 28px 32px;
            border-radius: 20px;
            color: white;
            background: linear-gradient(120deg, #272568, #5544c9, #8871ed);
            box-shadow: 0 10px 30px #3730a333;
          }

          .dashboard-header h1 {
            font-size: 28px;
            margin-bottom: 8px;
          }

          .dashboard-header p {
            color: #e1ddff;
            font-size: 15px;
          }

          .dashboard-section {
            width: 90%;
            max-width: 1150px;
            margin: auto;
          }

          .dashboard-title {
            margin: 25px 0;
            color: #30256e;
            font-size: 23px;
          }

          .dashboard-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .dashboard-card {
            background: white;
            padding: 28px;
            border-radius: 18px;
            border: 1px solid #e9e5ff;
            box-shadow: 0 6px 22px #33247712;
          }

          .dashboard-card h3 {
            color: #4936a5;
            margin-bottom: 15px;
            font-size: 20px;
          }

          .dashboard-card p {
            color: #77758c;
            line-height: 1.7;
          }


.dashboard-app input,
.dashboard-app textarea,
.dashboard-app select {
  display: block;
  width: 100%;
  margin: 13px 0;
  padding: 14px;
  border: 1px solid #b8b3cc;
  border-radius: 10px;
  background: #ffffff;
  color: #222222;
  font-size: 16px;
  font-family: inherit;
  opacity: 1;
}

.dashboard-app input::placeholder,
.dashboard-app textarea::placeholder {
  color: #666666;
  opacity: 1;
}

.dashboard-app textarea {
  min-height: 120px;
  resize: vertical;
}


          .dashboard-app input:focus,
          .dashboard-app textarea:focus,
          .dashboard-app select:focus {
            outline: 2px solid #9582ed;
            border-color: #7159d6;
          }

          .dashboard-button {
            width: 100%;
            margin-top: 15px;
            padding: 14px;
            border: none;
            border-radius: 12px;
            color: white;
            background: linear-gradient(120deg, #5140bd, #8964e8);
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
          }

          .dashboard-button:hover {
            opacity: 0.9;
          }

          .logout-button {
            width: 100%;
            max-width: 200px;
            margin-top: 25px;
            padding: 13px;
            border: none;
            border-radius: 10px;
            background: #dc3545;
            color: white;
            font-weight: bold;
            cursor: pointer;
          }

          @media(max-width: 750px) {
            .dashboard-section,
            .dashboard-header {
              width: 94%;
            }

            .dashboard-header {
              padding: 23px;
            }

            .dashboard-header h1 {
              font-size: 23px;
            }
          }
        `}</style>

        <div className="dashboard-header">
          <h1>SmartCampus Dashboard</h1>
          <p>Welcome, {loggedInUser.full_name}!</p>
        </div>

        <section className="dashboard-section">
          <h2 className="dashboard-title">Student Dashboard</h2>

          <div className="dashboard-cards">

            {/* SUBMIT COMPLAINT */}
            <div className="dashboard-card">
              <h3>📝 Submit Complaint</h3>

              <form onSubmit={async (e) => {
                e.preventDefault();

                try {
                  const response = await fetch(
                    "https://smart-campus-backend-4ugy.onrender.com/complaints",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        student_id: loggedInUser.user_id,
                        title,
                        description,
                        category,
                        priority
                      })
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.detail || "Complaint submission failed");
                    return;
                  }

                  alert(
                    "Complaint submitted successfully! ID: " +
                    data.complaint_id
                  );

                  setTitle("");
                  setDescription("");
                  setCategory("Hostel");
                  setPriority("Medium");

                  const refreshResponse = await fetch(
                    `https://smart-campus-backend-4ugy.onrender.com/complaints/${loggedInUser.user_id}`
                  );

                  const refreshedData = await refreshResponse.json();
                  setMyComplaints(refreshedData);

                } catch (error) {
                  alert("Backend connection failed!");
                }
              }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Complaint Title"
                  required
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your problem"
                  required
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Hostel">Hostel</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Library">Library</option>
                  <option value="Transport">Transport</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>

                <button type="submit" className="dashboard-button">
                  Submit Complaint
                </button>
              </form>
            </div>

            {/* MY COMPLAINTS */}
            <div className="dashboard-card">
              <h3>📋 My Complaints</h3>

              {myComplaints.length === 0 ? (
                <p>No complaints submitted yet.</p>
              ) : (
                myComplaints.map((complaint) => (
                  <div
                    key={complaint.complaint_id}
                    style={{
                      background: "#f5f3ff",
                      padding: "16px",
                      borderRadius: "12px",
                      marginTop: "15px",
                      borderLeft: "4px solid #6256e8"
                    }}
                  >
                    <h4>{complaint.title}</h4>
                    <p>Complaint ID: {complaint.complaint_id}</p>
                    <p>Category: {complaint.category}</p>
                    <p>Priority: {complaint.priority}</p>
                    <p>Status: {complaint.status}</p>
                  </div>
                ))
              )}
            </div>

            {/* TRACK STATUS */}
            <div className="dashboard-card">
              <h3>📊 Track Status</h3>

              {myComplaints.length === 0 ? (
                <p>No complaints available to track.</p>
              ) : (
                myComplaints.map((complaint) => (
                  <div
                    key={complaint.complaint_id}
                    style={{
                      background: "#f5f3ff",
                      padding: "16px",
                      borderRadius: "12px",
                      marginTop: "15px"
                    }}
                  >
                    <h4>{complaint.title}</h4>
                    <p>Complaint ID: {complaint.complaint_id}</p>
                    <p>
                      Current Status:{" "}
                      <strong style={{
                        color:
                          complaint.status === "Resolved"
                            ? "green"
                            : complaint.status === "In Progress"
                            ? "#d97706"
                            : "#dc3545"
                      }}>
                        {complaint.status}
                      </strong>
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* FEEDBACK */}
            <div className="dashboard-card">
              <h3>⭐ Feedback</h3>

              {myComplaints.filter(
                (complaint) => complaint.status === "Resolved"
              ).length === 0 ? (
                <p>
                  Feedback can be submitted after complaint resolution.
                </p>
              ) : (
                myComplaints
                  .filter(
                    (complaint) => complaint.status === "Resolved"
                  )
                  .map((complaint) => (
                    <form
                      key={complaint.complaint_id}
                      onSubmit={async (e) => {
                        e.preventDefault();

                        try {
                          const response = await fetch(
                            "https://smart-campus-backend-4ugy.onrender.com/feedback",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                complaint_id: complaint.complaint_id,
                                student_id: loggedInUser.user_id,
                                rating: Number(rating),
                                comments: comments
                              })
                            }
                          );

                          const data = await response.json();

                          if (!response.ok) {
                            alert(
                              data.detail || "Feedback submission failed"
                            );
                            return;
                          }

                          alert("Feedback submitted successfully!");
                          setComments("");

                        } catch (error) {
                          alert("Backend connection failed!");
                        }
                      }}
                      style={{
                        background: "#f5f3ff",
                        padding: "16px",
                        borderRadius: "12px",
                        marginTop: "15px"
                      }}
                    >
                      <h4>{complaint.title}</h4>
                      <p>Complaint ID: {complaint.complaint_id}</p>

                      <label>Rating (1 to 5)</label>

                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Average</option>
                        <option value="1">1 - Poor</option>
                      </select>

                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Write your feedback..."
                      />

                      <button
                        type="submit"
                        className="dashboard-button"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  ))
              )}
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </section>
      </div>
    );
  }

  // HOMEPAGE
  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #e0e7ff, #f5eaff, #e0f2fe);
          background-attachment: fixed;
        }

        .app {
          min-height: 100vh;
          color: #202442;
          background: transparent;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 8%;
        }

        .brand {
          font-size: 22px;
          font-weight: 800;
          color: #3730a3;
        }

        .brand span {
          color: #8b5cf6;
        }

        .nav-links {
          display: flex;
          gap: 30px;
          color: #666b83;
          font-size: 14px;
        }

        .hero {
          margin: 35px auto;
          width: 84%;
          min-height: 320px;
          border-radius: 24px;
          padding: 55px 7%;
          color: white;
          background: linear-gradient(120deg,#272568,#5544c9,#8871ed);
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        }

        .hero-content {
          max-width: 580px;
        }

        .tag {
          background: #ffffff20;
          padding: 9px 15px;
          border-radius: 30px;
          font-size: 12px;
        }

        .hero h1 {
          font-size: clamp(32px,4vw,48px);
          line-height: 1.15;
          margin: 24px 0 15px;
        }

        .hero p {
          color: #e1ddff;
          line-height: 1.8;
          font-size: 15px;
        }

        .hero-art {
          font-size: 115px;
          opacity: .9;
          padding: 20px;
        }

        .section {
          width: 84%;
          margin: 55px auto;
        }

        .section-heading {
          text-align: center;
          margin-bottom: 30px;
        }

        .section-heading h2 {
          font-size: 29px;
          margin-bottom: 9px;
        }

        .section-heading p {
          color: #85899e;
          font-size: 14px;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 22px;
        }

        .role-card {
          background: white;
          border: 1px solid #ececf5;
          border-radius: 18px;
          padding: 28px;
          transition: .2s;
          cursor: pointer;
          box-shadow: 0 5px 20px #24245a08;
        }

        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px #24245a14;
        }

        .role-card.active {
          border: 2px solid #6856dc;
          background: #f9f8ff;
        }

        .role-icon {
          font-size: 34px;
          margin-bottom: 18px;
        }

        .role-card h3 {
          font-size: 20px;
          margin-bottom: 10px;
        }

        .role-card p {
          color: #85899e;
          font-size: 14px;
          line-height: 1.7;
          min-height: 48px;
        }

        .role-button {
          margin-top: 22px;
          width: 100%;
          border: 0;
          border-radius: 9px;
          padding: 13px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          background: #5544c9;
        }

        .selected {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          box-shadow: 0 12px 35px rgba(40, 40, 90, 0.12);
        }

        .selected input {
          display: block;
          width: 100%;
          margin: 12px 0;
          padding: 13px;
          border: 1px solid #ded9f5;
          border-radius: 9px;
          font-size: 15px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
          margin-top: 45px;
        }

        .stat {
          background: white;
          padding: 23px;
          border-radius: 14px;
          text-align: center;
        }

        .stat h3 {
          color: #5544c9;
          font-size: 27px;
          margin-bottom: 6px;
        }

        .stat p {
          color: #85899e;
          font-size: 13px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
        }

        .step {
          background: white;
          border-radius: 15px;
          padding: 25px;
        }

        .step b {
          color: #6654d8;
          font-size: 24px;
        }

        .step h3 {
          margin: 13px 0 8px;
        }

        .step p {
          color: #85899e;
          font-size: 14px;
          line-height: 1.7;
        }

        footer {
          margin-top: 65px;
          background: #20204e;
          color: white;
          text-align: center;
          padding: 28px;
          font-size: 13px;
        }

        @media(max-width:750px) {
          .navbar {
            padding: 0 5%;
          }

          .nav-links {
            display: none;
          }

          .hero {
            width: 92%;
            padding: 35px 25px;
          }

          .hero-art {
            display: none;
          }

          .section {
            width: 92%;
          }

          .role-grid,
          .steps {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="brand">
          Smart<span>Campus.</span>
        </div>

        <div className="nav-links">
          <span>Home</span>
          <span>Services</span>
          <span>How It Works</span>
          <span>Contact</span>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">
            ✦ SMART CAMPUS DIGITAL PLATFORM
          </span>

          <h1>
            Making Campus Better, One Complaint at a Time.
          </h1>

          <p>
            A smarter way to report campus issues, track complaints
            and connect with the people who can resolve them.
          </p>
        </div>

        <div className="hero-art">🏫</div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Access Your Portal</h2>
          <p>
            Select your role to continue to the Smart Campus system.
          </p>
        </div>

        <div className="role-grid">
          {roles.map((role) => (
            <div
              className={`role-card ${
                selectedRole === role.name ? "active" : ""
              }`}
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
            >
              <div className="role-icon">{role.icon}</div>
              <h3>{role.name} Portal</h3>
              <p>{role.desc}</p>

              <button
                className="role-button"
                style={{ background: role.color }}
                onClick={() => setSelectedRole(role.name)}
              >
                Continue as {role.name} →
              </button>
            </div>
          ))}
        </div>

        {selectedRole && (
          <div
            className="selected"
            style={{
              maxWidth: "450px",
              margin: "30px auto",
              padding: "30px"
            }}
          >
            <h2 style={{
              marginBottom: "10px",
              color: "#3730a3"
            }}>
              {selectedRole} Login
            </h2>

            <p style={{
              marginBottom: "22px",
              color: "#85899e"
            }}>
              Enter your account details to continue
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();

              try {
                const response = await fetch(
                  "https://smart-campus-backend-4ugy.onrender.com/login",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      email: email,
                      password: password
                    })
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.detail || "Login failed");
                  return;
                }

                if (
                  data.role.toLowerCase() !==
                  selectedRole.toLowerCase()
                ) {
                  alert("Selected role does not match your account!");
                  return;
                }

                setLoggedInUser(data);

              } catch (error) {
                alert("Backend connection failed!");
              }
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />

              <button type="submit" className="role-button">
                Login as {selectedRole}
              </button>
            </form>
          </div>
        )}

        <div className="stats">
          <div className="stat">
            <h3>24/7</h3>
            <p>Complaint Submission</p>
          </div>

          <div className="stat">
            <h3>3</h3>
            <p>User Roles</p>
          </div>

          <div className="stat">
            <h3>Easy</h3>
            <p>Complaint Tracking</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>How It Works</h2>
          <p>Three simple steps to resolve campus issues.</p>
        </div>

        <div className="steps">
          <div className="step">
            <b>01</b>
            <h3>Submit Complaint</h3>
            <p>
              Students can report campus problems by submitting
              complaint details.
            </p>
          </div>

          <div className="step">
            <b>02</b>
            <h3>Assign & Track</h3>
            <p>
              Admins assign complaints to staff and students can
              track progress.
            </p>
          </div>

          <div className="step">
            <b>03</b>
            <h3>Resolve & Review</h3>
            <p>
              Staff resolve issues and students can share their
              feedback.
            </p>
          </div>
        </div>
      </section>

      <footer>
        © 2026 Smart Campus Complaint and Resolution System | College Project
      </footer>
    </div>
  );
}

export default App;
