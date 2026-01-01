// src/admin/AdminLogin.tsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom"; // ← Import this!

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // ← Hook to redirect programmatically

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (
        email === "admin@juliaortizluisnhs.deped.gov.ph" &&
        password === "admin123"
      ) {
        onLogin(); // ← Sets localStorage & auth state in App.tsx
        navigate("/admin"); // ← Directly redirect to /admin dashboard
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(30,58,138,0.15)",
          }}
        >
          <SchoolIcon sx={{ fontSize: 60, color: "#1e3a8a", mb: 3 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#1e3a8a"
            gutterBottom
          >
            Admin Login
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Access the Julia Ortiz Luis NHS Admin Dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Admin Email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
              required
              type="email"
              placeholder="admin@juliaortizluisnhs.deped.gov.ph"
            />
            <TextField
              label="Password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
              type="password"
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderRadius: 50,
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(30,58,138,0.3)",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Box>

          {/* <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: "block" }}
          >
            Test credentials: admin@juliaortizluisnhs.deped.gov.ph / admin123
          </Typography> */}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin;
