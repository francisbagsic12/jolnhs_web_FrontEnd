// src/admin/components/OverviewTab.tsx
import React, { useState, useEffect } from "react";
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
  Skeleton,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { styled } from "@mui/material/styles";

const BACKEND_URL = "https://jolnhsweb.onrender.com"; // Change to production URL

// Hologram Card Style
const HoloCard = styled(Card)(({ theme }) => ({
  background: "rgba(15, 23, 42, 0.67)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(96, 165, 250, 0.25)",
  borderRadius: 24,
  overflow: "hidden",
  // boxShadow:
  //   "0 15px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(96, 165, 250, 0.15)",
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  position: "relative",
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(167,139,250,0.12) 50%, rgba(192,132,252,0.12) 100%)",
    pointerEvents: "none",
  },
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 30px 80px rgba(96, 165, 250, 0.35)",
    borderColor: "rgba(96, 165, 250, 0.6)",
  },
}));

const ShimmerSkeleton = styled(Skeleton)({
  background:
    "linear-gradient(90deg, #1e3a8a22 0%, #60a5fa44 50%, #1e3a8a22 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
  },
});

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

interface PositionStats {
  name: string;
  votes: number;
}

interface VotingStats {
  totalVoters: number;
  totalVotesCast: number;
  turnoutPercentage: string;
  byPosition: Record<string, PositionStats[]>;
}

interface RegistrationStats {
  totalRegistrations: number;
  byClub: Record<string, number>;
}

const OverviewTab: React.FC = () => {
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [registrationStats, setRegistrationStats] =
    useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [votingRes, regRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/dashboard-voting-stats`),
        fetch(`${BACKEND_URL}/api/admin/dashboard-registration-stats`),
      ]);

      if (!votingRes.ok) throw new Error("Failed to load voting stats");
      if (!regRes.ok) throw new Error("Failed to load registration stats");

      const votingData = await votingRes.json();
      const regData = await regRes.json();

      setVotingStats(votingData);
      setRegistrationStats(regData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = (type: "votes" | "registrations") => {
    setIsExporting(true);

    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";

    if (type === "votes" && votingStats) {
      csvContent += "Position,Candidate,Votes\n";
      positionOrder.forEach((pos) => {
        const candidates = votingStats.byPosition[pos] || [];
        candidates.forEach((c) => {
          csvContent += `${positionLabels[pos]},${c.name},${c.votes}\n`;
        });
      });
      filename = "ssg_election_results.csv";
    } else if (type === "registrations" && registrationStats) {
      csvContent += "Club,Total Registrations\n";
      Object.entries(registrationStats.byClub).forEach(([club, count]) => {
        csvContent += `${club},${count}\n`;
      });
      filename = "club_registrations_summary.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 1000);
  };

  const hasVotes = votingStats ? votingStats.totalVotesCast > 0 : false;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, position: "relative", overflow: "hidden" }}>
      {/* Subtle Hologram Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 70%, rgba(96,165,250,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 6,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="900"
          sx={{
            background: "linear-gradient(90deg, #60a5fa, #a78bfa, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Overview Dashboard
        </Typography>

        <Tooltip title="Refresh Dashboard">
          <IconButton
            color="primary"
            onClick={fetchData}
            disabled={loading}
            sx={{
              bgcolor: alpha("#60a5fa", 0.15),
              "&:hover": {
                bgcolor: alpha("#60a5fa", 0.35),
                transform: "rotate(180deg)",
              },
              transition: "all 0.6s ease",
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={4}>
          {[...Array(2)].map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <HoloCard sx={{ height: 520 }}>
                <Skeleton
                  variant="rectangular"
                  height="100%"
                  animation="wave"
                />
              </HoloCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={4}>
          {/* SSG Election Results - Holographic Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <HoloCard>
              <Box
                sx={{
                  bgcolor: alpha("#1e3a8a", 0.7),
                  color: "white",
                  p: 3,
                  borderBottom: "1px solid rgba(96,165,250,0.3)",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  SSG Election Holographic Leaders
                </Typography>
              </Box>
              <CardContent sx={{ pt: 5, pb: 5 }}>
                <Typography
                  variant="h1"
                  fontWeight="900"
                  color="#60a5fa"
                  align="center"
                  sx={{
                    textShadow: "0 0 20px rgba(96,165,250,0.6)",
                    mb: 1,
                  }}
                >
                  {votingStats?.turnoutPercentage ?? "0"}%
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  color="rgba(255,255,255,0.8)"
                  sx={{ mb: 5 }}
                >
                  Voter Turnout • {votingStats?.totalVotesCast ?? 0} /{" "}
                  {votingStats?.totalVoters ?? 0} votes cast
                </Typography>

                <Divider sx={{ my: 4, borderColor: "rgba(96,165,250,0.3)" }} />

                {!hasVotes ? (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 4,
                      bgcolor: alpha("#1e3a8a", 0.4),
                      color: "white",
                    }}
                  >
                    No votes recorded yet. Results will appear in real-time once
                    voting begins.
                  </Alert>
                ) : (
                  positionOrder.map((position) => {
                    const candidates = votingStats?.byPosition[position] || [];
                    const sorted = [...candidates].sort(
                      (a, b) => b.votes - a.votes
                    );
                    const leader = sorted[0];

                    if (!leader || leader.votes === 0) return null;

                    return (
                      <Box key={position} sx={{ mb: 5 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "#60a5fa",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            textShadow: "0 0 10px rgba(96,165,250,0.5)",
                          }}
                        >
                          <EmojiEventsIcon sx={{ color: "#ffd700" }} />
                          {positionLabels[position]}
                        </Typography>

                        <Box sx={{ pl: 2 }}>
                          {/* Leader Highlight */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 3,
                              mb: 2,
                              bgcolor: alpha("#60a5fa", 0.12),
                              borderRadius: 3,
                              border: "1px solid rgba(96,165,250,0.4)",
                              boxShadow: "0 0 20px rgba(96,165,250,0.25)",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="white"
                            >
                              🏆 {leader.name}
                            </Typography>
                            <Chip
                              label={`${leader.votes} vote${
                                leader.votes === 1 ? "" : "s"
                              }`}
                              color="primary"
                              size="medium"
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                px: 2,
                                py: 1,
                              }}
                            />
                          </Box>

                          {/* Others */}
                          {sorted.slice(1).map((c, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 1.5,
                                pl: 3,
                                borderLeft: "3px solid rgba(96,165,250,0.3)",
                              }}
                            >
                              <Typography
                                variant="body1"
                                color="rgba(255,255,255,0.9)"
                              >
                                {c.name}
                              </Typography>
                              <Typography
                                variant="body1"
                                color="rgba(255,255,255,0.7)"
                              >
                                {c.votes} vote{c.votes === 1 ? "" : "s"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })
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
                  sx={{
                    mt: 5,
                    borderRadius: 50,
                    py: 2,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: "0 0 20px rgba(96,165,250,0.5)",
                    "&:hover": {
                      boxShadow: "0 0 40px rgba(96,165,250,0.8)",
                    },
                  }}
                  onClick={() => exportToCSV("votes")}
                  disabled={isExporting || !hasVotes}
                >
                  {hasVotes
                    ? "Export Full Election Hologram (CSV)"
                    : "No Results Available"}
                </Button>
              </CardContent>
            </HoloCard>
          </Grid>

          {/* Club Registration Holo Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <HoloCard sx={{ height: "100%" }}>
              <Box
                sx={{ bgcolor: alpha("#1e3a8a", 0.7), color: "white", p: 3 }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Club Registration Matrix
                </Typography>
              </Box>
              <CardContent sx={{ pt: 5 }}>
                <Typography
                  variant="h1"
                  fontWeight="900"
                  color="#60a5fa"
                  align="center"
                  sx={{ textShadow: "0 0 20px rgba(96,165,250,0.6)" }}
                >
                  {registrationStats?.totalRegistrations ?? 0}
                </Typography>
                <Typography
                  align="center"
                  color="rgba(255,255,255,0.8)"
                  sx={{ mb: 5 }}
                >
                  Total Joined Clubs
                </Typography>

                {registrationStats?.totalRegistrations === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 4,
                      bgcolor: alpha("#1e3a8a", 0.4),
                      color: "white",
                    }}
                  >
                    No registrations yet. Matrix will populate as students join
                    clubs.
                  </Alert>
                ) : (
                  <>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="#60a5fa"
                      sx={{ mb: 3 }}
                    >
                      Club Distribution
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {Object.entries(registrationStats?.byClub ?? {})
                        .filter(([, count]) => count > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([club, count]) => (
                          <Box
                            key={club}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 2,
                              bgcolor: alpha("#60a5fa", 0.12),
                              borderRadius: 3,
                              border: "1px solid rgba(96,165,250,0.3)",
                              transition: "all 0.3s",
                              "&:hover": {
                                transform: "translateX(8px)",
                                boxShadow: "0 0 20px rgba(96,165,250,0.3)",
                              },
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="white"
                            >
                              {club} Club
                            </Typography>
                            <Chip
                              label={count}
                              color="primary"
                              size="medium"
                              sx={{
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                px: 3,
                                py: 1,
                              }}
                            />
                          </Box>
                        ))}
                    </Box>
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
                  sx={{
                    mt: 5,
                    borderRadius: 50,
                    py: 2,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: "0 0 20px rgba(96,165,250,0.5)",
                    "&:hover": {
                      boxShadow: "0 0 40px rgba(96,165,250,0.8)",
                    },
                  }}
                  onClick={() => exportToCSV("registrations")}
                  disabled={
                    isExporting || registrationStats?.totalRegistrations === 0
                  }
                >
                  {registrationStats?.totalRegistrations ?? 0 > 0
                    ? "Export Registration Matrix (CSV)"
                    : "No Data to Export"}
                </Button>
              </CardContent>
            </HoloCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default OverviewTab;
