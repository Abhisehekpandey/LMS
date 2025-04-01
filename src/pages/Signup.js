// src/pages/Signup.js
import React, { useState } from "react";
import { TextField, Button, Container, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Save user credentials in session storage
    sessionStorage.setItem("user", JSON.stringify({ name, email, password }));
    // Redirect to login page
    navigate("/login");
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h1" gutterBottom>
        Signup
      </Typography>
      <form onSubmit={handleSignup}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          Signup
        </Button>
      </form>
      <Typography variant="body2" align="center" style={{ marginTop: "16px" }}>
        Already registered?{" "}
        <Link href="/login" color="primary">
          Login
        </Link>
      </Typography>
    </Container>
  );
};

export default Signup;
