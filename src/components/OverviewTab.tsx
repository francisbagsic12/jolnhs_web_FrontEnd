// src/admin/components/OverviewTab.tsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface OverviewTabProps {
  votingStats: {
    totalVoters: number;
    totalVotesCast: number;
    turnoutPercentage: string;
    byPosition: {
      President: Array<{ name: string; votes: number }>;
      VicePresident: Array<{ name: string; votes: number }>;
      Secretary: Array<{ name: string; votes: number }>;
      Treasurer: Array<{ name: string; votes: number }>;
      Auditor: Array<{ name: string; votes: number }>;
      PIO: Array<{ name: string; votes: number }>;
      PeaceOfficer: Array<{ name: string; votes: number }>;
    };
  };
  registrationStats: {
    totalRegistrations: number;
    byClub: Record<string, number>;
  };
  isExporting: boolean;
  handleExport: (type: "votes" | "registrations") => void;
}

const positionOrder = [
  "President",
  "VicePresident",
  "Secretary",
  "Treasurer",
  "Auditor",
  "PIO",
  "PeaceOfficer",
] as const;

const positionLabels: Record<string, string> = {
  President: "President",
  VicePresident: "Vice President",
  Secretary: "Secretary",
  Treasurer: "Treasurer",
  Auditor: "Auditor",
  PIO: "P.I.O.",
  PeaceOfficer: "Peace Officer",
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  votingStats,
  registrationStats,
  isExporting,
  handleExport,
}) => {
  const hasVotes = votingStats.totalVotesCast > 0;

  return (
    <Grid container spacing={4}>
      {/* SSG Election Results Card */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card elevation={12} sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#1e3a8a", color: "white", p: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              SSG Election Results - Current Leaders
            </Typography>
          </Box>
          <CardContent sx={{ pt: 4 }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              color="#1e3a8a"
              align="center"
            >
              {votingStats.turnoutPercentage}%
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
              Voter Turnout ({votingStats.totalVotesCast}/
              {votingStats.totalVoters} students voted)
            </Typography>

            <Divider sx={{ my: 4 }} />

            {!hasVotes ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No votes have been cast yet. Results will appear here once
                voting starts.
              </Alert>
            ) : (
              <>
                {positionOrder.map((position) => {
                  const candidates = votingStats.byPosition[position] || [];
                  // Sort candidates by votes descending
                  const sortedCandidates = [...candidates].sort(
                    (a, b) => b.votes - a.votes
                  );
                  const leadingCandidate = sortedCandidates[0];

                  if (!leadingCandidate || leadingCandidate.votes === 0) {
                    return null; // Skip if no votes for this position
                  }

                  return (
                    <Box key={position} sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#1e3a8a"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <EmojiEventsIcon fontSize="small" />
                        {positionLabels[position]}
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {/* Leading Candidate */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            p: 2,
                            bgcolor: "#f0f7ff",
                            borderRadius: 2,
                            border: "1px solid #1e3a8a33",
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="#1e3a8a"
                          >
                            🏆 {leadingCandidate.name}
                          </Typography>
                          <Chip
                            label={`${leadingCandidate.votes} vote${
                              leadingCandidate.votes === 1 ? "" : "s"
                            }`}
                            color="primary"
                            variant="filled"
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          />
                        </Box>

                        {/* Other Candidates */}
                        {sortedCandidates.slice(1).map((candidate, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              ml: 3,
                              py: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {candidate.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {candidate.votes} vote
                              {candidate.votes === 1 ? "" : "s"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={
                isExporting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              sx={{ mt: 4, borderRadius: 50, fontWeight: "bold", py: 1.5 }}
              onClick={() => handleExport("votes")}
              disabled={isExporting || !hasVotes}
            >
              {hasVotes
                ? "Export Full Election Results (CSV)"
                : "No Results to Export Yet"}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Club Registration Summary Card */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card
          elevation={12}
          sx={{ borderRadius: 4, overflow: "hidden", height: "100%" }}
        >
          <Box sx={{ bgcolor: "#1e3a8a", color: "white", p: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Club Registration Summary
            </Typography>
          </Box>
          <CardContent
            sx={{
              pt: 4,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h2"
                fontWeight="bold"
                color="#1e3a8a"
                align="center"
              >
                {registrationStats.totalRegistrations}
              </Typography>
              <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
                Total Students Joined Clubs
              </Typography>

              {registrationStats.totalRegistrations === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No students have registered for clubs yet.
                </Alert>
              ) : (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="#1e3a8a"
                    sx={{ mb: 2 }}
                  >
                    Breakdown by Club
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {Object.entries(registrationStats.byClub)
                      .filter(([, count]) => count > 0) // Hide clubs with 0 members
                      .sort(([, a], [, b]) => b - a) // Highest first
                      .map(([club, count]) => (
                        <Box
                          key={club}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.5,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body1" fontWeight="medium">
                            {club} Club
                          </Typography>
                          <Chip
                            label={count}
                            color="primary"
                            size="medium"
                            sx={{
                              minWidth: 60,
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                </>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={
                isExporting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              sx={{ mt: 4, borderRadius: 50, fontWeight: "bold", py: 1.5 }}
              onClick={() => handleExport("registrations")}
              disabled={
                isExporting || registrationStats.totalRegistrations === 0
              }
            >
              {registrationStats.totalRegistrations > 0
                ? "Export Club Registration Data (CSV)"
                : "No Club Data to Export"}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
