import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/user", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout", { withCredentials: true })
      .then(() => {
        navigate("/login");
      });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <img src={user.profile_picture} alt="Profile" />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;