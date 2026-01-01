// src/admin/components/AnnouncementsTab.tsx
import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from "@mui/material";

interface AnnouncementsTabProps {
  announcement?: string;
  setAnnouncement?: (value: string) => void;
  announceSuccess?: boolean;
  handleAnnounce?: (e: React.FormEvent) => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcement,
  setAnnouncement = () => {},
  announceSuccess,
  handleAnnounce,
}) => {
  return (
    <Paper elevation={8} sx={{ borderRadius: 4, p: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="#1e3a8a" gutterBottom>
        Manage Announcements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Post updates for the school website homepage.
      </Typography>
      <Box component="form" onSubmit={handleAnnounce}>
        <TextField
          label="New Announcement"
          multiline
          rows={5}
          fullWidth
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="e.g., Voting deadline extended to December 20, 2025!"
          required
          sx={{ mb: 3 }}
        />
        {announceSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Announcement published successfully!
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 50,
            fontWeight: "bold",
          }}
        >
          Publish Announcement
        </Button>
      </Box>
    </Paper>
  );
};
