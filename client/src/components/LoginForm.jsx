import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import '../assets/styles/login.css'

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Corrected useNavigate usage

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      Email: email,
      Password: password,
    };

    setIsLoading(true); // Set loading state

    try {
      const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Response Result:", result); // Debugging response

      if (response.ok) {
        alert("Login successful!");
        console.log(result.token);
        Cookies.set("token", result.token); // Save the token in cookies
        navigate("/admin/notices",{replace:true}); // Corrected navigation
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/admin/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;