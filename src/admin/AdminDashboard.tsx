// src/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  alpha,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { Sidebar } from "../components/Sidebar";
import OverviewTab from "../components/OverviewTab";
import { VotingMonitorTab } from "../components/VotingMonitorTab";
import ClubRegistrationsTab from "../components/ClubRegistrationsTab";
import { AnnouncementsTab } from "../components/AnnouncementsTab";
import { ElectionControlTab } from "../components/ElectionControlTab";
import { ElectionResultsTab } from "../components/ElectionResultsTab";
import VoteHistory from "../components/VoteHistory";

const API_BASE = "http://localhost:5000/api";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface VotingStats {
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
}

interface RegistrationStats {
  totalRegistrations: number;
  byClub: Record<string, number>;
}

interface ElectionStatus {
  currentElectionId: string | null;
  isVotingActive: boolean;
}

interface WinnerData {
  electionTitle: string;
  completedAt?: string;
  winners: Array<{
    positionLabel: string;
    winnerName: string;
    winnerTeam: string;
    votes?: number;
    percentage?: string;
  }>;
  totalVotes?: number;
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

const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  value: number;
}> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`}>
    {value === index && <Box sx={{ pt: { xs: 2, md: 4 } }}>{children}</Box>}
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [tabValue, setTabValue] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [_votingStats, setVotingStats] = useState<VotingStats>({
    totalVoters: 0,
    totalVotesCast: 0,
    turnoutPercentage: "0.0",
    byPosition: {
      President: [],
      VicePresident: [],
      Secretary: [],
      Treasurer: [],
      Auditor: [],
      PIO: [],
      PeaceOfficer: [],
    },
  });

  const [_registrationStats, setRegistrationStats] =
    useState<RegistrationStats>({
      totalRegistrations: 0,
      byClub: {},
    });

  const [electionStatus, setElectionStatus] = useState<ElectionStatus>({
    currentElectionId: null,
    isVotingActive: false,
  });

  const [recentWinners, setRecentWinners] = useState<WinnerData | null>(null);

  // const [isExporting, setIsExporting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Election Status
      const statusRes = await fetch(`${API_BASE}/admin/election-status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setElectionStatus(statusData);
      }

      // 2. Voting Stats
      const votingRes = await fetch(`${API_BASE}/admin/dashboard-voting-stats`);
      if (votingRes.ok) {
        const votingData = await votingRes.json();
        setVotingStats(votingData);
      }

      // 3. Registration Stats
      const regRes = await fetch(
        `${API_BASE}/admin/dashboard-registration-stats`
      );
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrationStats(regData);
      }

      // 4. Most Recent Winners (hierarchical order)
      const winnersRes = await fetch(`${API_BASE}/admin/winners`);
      if (winnersRes.ok) {
        const winnersData = await winnersRes.json();
        if (winnersData.winners?.length > 0) {
          // Sort winners based on position hierarchy
          const sortedWinners = [...winnersData.winners].sort((a, b) => {
            const aIndex = positionOrder.findIndex(
              (pos) =>
                positionLabels[pos].toLowerCase() ===
                a.positionLabel.toLowerCase()
            );
            const bIndex = positionOrder.findIndex(
              (pos) =>
                positionLabels[pos].toLowerCase() ===
                b.positionLabel.toLowerCase()
            );
            return aIndex - bIndex; // Lower index = higher position
          });

          setRecentWinners({
            electionTitle: winnersData.electionTitle || "Most Recent Election",
            completedAt: winnersData.completedAt
              ? new Date(winnersData.completedAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                })
              : undefined,
            winners: sortedWinners,
            totalVotes: winnersData.totalVotes,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "May error sa pag-load ng dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // const handleExport = (type: "votes" | "registrations") => {
  //   setIsExporting(true);
  //   setTimeout(() => {
  //     alert(`Exported ${type} data as CSV! (Demo)`);
  //     setIsExporting(false);
  //   }, 1500);
  // };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9ff" }}>
      <Sidebar
        tabValue={tabValue}
        setTabValue={setTabValue}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={onLogout}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 5 },
          ml: { md: "280px" },
          width: { xs: "100%", md: `calc(100% - 280px)` },
        }}
      >
        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error} —{" "}
              <Button color="inherit" onClick={fetchDashboardData}>
                Subukang muli
              </Button>
            </Alert>
          )}

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <OverviewTab />

            {/* === HIERARCHICAL MOST RECENT ELECTED OFFICERS === */}
            {recentWinners && recentWinners.winners.length > 0 && (
              <Paper
                elevation={8}
                sx={{
                  mt: 8,
                  p: 5,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 10px 40px rgba(30,58,138,0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background subtle gradient */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                    opacity: 0.6,
                    zIndex: 0,
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 5,
                      pb: 3,
                      borderBottom: "3px solid #1e3a8a",
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 48, color: "#1e3a8a" }} />
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#1e3a8a"
                      >
                        Elected Officers
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {recentWinners.electionTitle}
                        {recentWinners.completedAt &&
                          ` • ${recentWinners.completedAt}`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    {positionOrder.map((posKey, index) => {
                      // Gumamit ng exact match base sa positionLabel (case-insensitive)
                      const winner = recentWinners.winners.find(
                        (w) =>
                          w.positionLabel.toLowerCase() ===
                          positionLabels[posKey].toLowerCase()
                      );

                      // Kung walang winner sa position na 'to, skip lang
                      if (!winner) return null;

                      const isTop = index === 0 || index === 1; // President & VP bigger

                      return (
                        <React.Fragment key={posKey}>
                          {/* Connector line (except first) */}
                          {index > 0 && (
                            <Box
                              sx={{
                                width: 4,
                                height: 40,
                                bgcolor: alpha("#1e3a8a", 0.4),
                                borderRadius: 2,
                              }}
                            />
                          )}

                          <Card
                            elevation={isTop ? 10 : 4}
                            sx={{
                              width: isTop ? { xs: "100%", md: "80%" } : "100%",
                              maxWidth: 700,
                              borderRadius: 4,
                              border: `2px solid ${
                                isTop ? "#1e3a8a" : alpha("#1e3a8a", 0.3)
                              }`,
                              bgcolor: isTop ? "#f0f7ff" : "white",
                              transition: "all 0.3s",
                              "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: isTop
                                  ? "0 20px 60px rgba(30,58,138,0.3)"
                                  : "0 10px 30px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            <CardContent sx={{ p: 4, textAlign: "center" }}>
                              <Typography
                                variant={isTop ? "h4" : "h5"}
                                fontWeight="bold"
                                color="#1e3a8a"
                                gutterBottom
                              >
                                {winner.positionLabel}
                              </Typography>

                              <Typography
                                variant={isTop ? "h3" : "h5"}
                                fontWeight="900"
                                color="text.primary"
                                sx={{ mb: 1 }}
                              >
                                {winner.winnerName}
                              </Typography>

                              <Chip
                                label={winner.winnerTeam || "Independent"}
                                size="medium"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 2, fontWeight: "bold" }}
                              />

                              {winner.votes && winner.percentage && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                  >
                                    {winner.votes.toLocaleString()} votes •{" "}
                                    {winner.percentage}%
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </React.Fragment>
                      );
                    })}
                  </Box>
                </Box>
              </Paper>
            )}

            {!recentWinners && !electionStatus.isVotingActive && (
              <Alert severity="info" sx={{ mt: 6 }}>
                No election results have been recorded yet.
              </Alert>
            )}
          </TabPanel>

          {/* Other tabs remain the same */}
          <TabPanel value={tabValue} index={1}>
            <VotingMonitorTab />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <ClubRegistrationsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <AnnouncementsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <ElectionControlTab />
          </TabPanel>
          <TabPanel value={tabValue} index={5}>
            <ElectionResultsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={6}>
            <VoteHistory />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
