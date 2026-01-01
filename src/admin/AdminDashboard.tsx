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
  Grid as Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { Sidebar } from "../components/Sidebar";
import { OverviewTab } from "../components/OverviewTab";
import { VotingMonitorTab } from "../components/VotingMonitorTab";

import ClubRegistrationsTab from "../components/ClubRegistrationsTab";
import { AnnouncementsTab } from "../components/AnnouncementsTab";
import { ElectionControlTab } from "../components/ElectionControlTab";
import { ElectionResultsTab } from "../components/ElectionResultsTab";
import VoteHistory from "../components/VoteHistory";
const API_BASE = "https://jolnhsweb.onrender.com/api";

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

  const [votingStats, setVotingStats] = useState<VotingStats>({
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

  const [registrationStats, setRegistrationStats] = useState<RegistrationStats>(
    {
      totalRegistrations: 0,
      byClub: {},
    }
  );

  const [electionStatus, setElectionStatus] = useState<ElectionStatus>({
    currentElectionId: null,
    isVotingActive: false,
  });

  const [recentWinners, setRecentWinners] = useState<WinnerData | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch all necessary data
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

      // 2. Voting Stats (current/latest)
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

      // 4. Most Recent Winners (palaging kunin ang latest mula sa Winner collection)
      // Gagamitin natin ang /api/admin/winners para sa current o pinakabagong
      const winnersRes = await fetch(`${API_BASE}/admin/winners`);
      if (winnersRes.ok) {
        const winnersData = await winnersRes.json();
        if (winnersData.winners?.length > 0) {
          setRecentWinners({
            electionTitle: winnersData.electionTitle || "Most Recent Election",
            completedAt: winnersData.completedAt
              ? new Date(winnersData.completedAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                })
              : undefined,
            winners: winnersData.winners,
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

  const handleExport = (type: "votes" | "registrations") => {
    setIsExporting(true);
    setTimeout(() => {
      alert(`Exported ${type} data as CSV! (Demo)`);
      setIsExporting(false);
    }, 1500);
  };

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
          {/* <Typography
            variant="h3"
            fontWeight="bold"
            color="#1e3a8a"
            gutterBottom
            sx={{ mt: { xs: 8, md: 0 } }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Real-time monitoring of election, club registrations, announcements
            and election control.
          </Typography> */}

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
            <OverviewTab
              votingStats={votingStats}
              registrationStats={registrationStats}
              isExporting={isExporting}
              handleExport={handleExport}
            />

            {/* === MOST RECENT ELECTED OFFICERS (Palaging makikita) === */}
            {recentWinners && recentWinners.winners.length > 0 && (
              <Paper
                elevation={6}
                sx={{
                  mt: 6,
                  p: 4,
                  borderRadius: 3,
                  bgcolor: "#fff",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 40, color: "#1e3a8a" }} />
                  <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
                    Most Recent Elected Officers ({recentWinners.electionTitle})
                    {recentWinners.completedAt &&
                      ` - ${recentWinners.completedAt}`}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                  {positionOrder.map((posKey) => {
                    const winner = recentWinners.winners.find((w) =>
                      w.positionLabel
                        .toLowerCase()
                        .includes(posKey.toLowerCase())
                    );
                    if (!winner) return null;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={posKey}>
                        <Card sx={{ height: "100%", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="#1e3a8a"
                              gutterBottom
                            >
                              {winner.positionLabel}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {winner.winnerName}
                            </Typography>
                            <Chip
                              label={winner.winnerTeam || "Independent"}
                              size="medium"
                              color="primary"
                              variant="outlined"
                              sx={{ mt: 2 }}
                            />
                            {winner.votes && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {winner.votes} votes • {winner.percentage}%
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            {!recentWinners && !electionStatus.isVotingActive && (
              <Alert severity="info" sx={{ mt: 6 }}>
                No results have been recorded yet from the previous election.
              </Alert>
            )}
          </TabPanel>

          {/* Iba pang tabs... */}
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
