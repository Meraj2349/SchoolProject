import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const data = {
      Username: username,
      Email: email,
      Password: password,
    };

    setIsLoading(true); // Set loading state

    try {
      // Make the POST request to create the admin
      const response = await fetch("http://localhost:3000/api/admin/createAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Check for response.ok and the success message
      if (response.ok && result.message === "Admin created successfully") {
        setSuccessMessage("Registration successful!");
        setErrorMessage(""); // Clear any previous error messages

        // Clear form fields
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Redirect to the login page after successful registration
        navigate("/admin/login");
      } else {
        // If there was an error in the response
        setErrorMessage(result.error || "Something went wrong.");
        setSuccessMessage(""); // Clear success message if error occurs
      }
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setSuccessMessage(""); // Clear success message if error occurs
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Admin Register</h2>

        {/* Display error and success messages */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="login-link">
          <p>
            Already have an account? <Link to="/admin/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;