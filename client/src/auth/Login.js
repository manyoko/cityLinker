import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the plain CSS file

const Login = () => {
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      setMessage("Login successful!");
      console.log(`message: ${message}`, result);
      navigate("/");
    } else {
      setMessage(result.message || "Login failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2 className="form-title">Login</h2>

      {message && <p className="message">{message}</p>}

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
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
