// src/admin/components/AnnouncementsTab.tsx
import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api";

export const AnnouncementsTab: React.FC = () => {
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!announcement.trim()) {
      setError("Please write something to announce.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: announcement.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to publish announcement");
      }

      setSuccess(true);
      setAnnouncement(""); // Clear input after success
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={8} sx={{ borderRadius: 4, p: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="#1e3a8a" gutterBottom>
        Manage Announcements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Post updates that will appear on the school website homepage.
      </Typography>

      <Box component="form" onSubmit={handleAnnounce}>
        <TextField
          label="New Announcement"
          multiline
          rows={5}
          fullWidth
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="e.g., Voting deadline extended to January 15, 2026!"
          required
          disabled={loading}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Announcement published successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading || !announcement.trim()}
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 50,
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Publish Announcement"
          )}
        </Button>
      </Box>
    </Paper>
  );
};
