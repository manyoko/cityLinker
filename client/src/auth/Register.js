import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./Register.css"; // Link to the plain CSS
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      setMessage("Registration successful!");
      navigate("/login");
    } else {
      setMessage(result.message || "Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2 className="form-title">Register</h2>

      {message && <p className="message">{message}</p>}

      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className="input-field"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="input-field"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="input-field"
        required
      />
      <select
        name="role"
        onChange={handleChange}
        className="input-field"
        value={formData.role}
      >
        <option value="user">User</option>
        <option value="provider">Provider</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default Register;
