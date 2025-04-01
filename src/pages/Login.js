// src/pages/Login.js
import React, { useState } from "react";
import { TextField, Button, Container, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem("user"));

    // Validate user credentials
    if (user && user.email === email && user.password === password) {
      navigate("/user"); // Redirect to Dashboard
    } else {
      setError("Wrong credentials. Please try again."); // Set error message
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}{" "}
      {/* Display error message */}
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
      <Typography variant="body2" align="center" style={{ marginTop: "16px" }}>
        New user?{" "}
        <Link href="/signup" color="primary">
          Signup
        </Link>
      </Typography>
    </Container>
  );
};

export default Login;
