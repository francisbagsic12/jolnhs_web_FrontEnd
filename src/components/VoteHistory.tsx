import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Modal,
  // Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  // FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Event as EventIcon,
  Close as CloseIcon,
  // Person as PersonIcon,
} from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";

const API_BASE = "https://jolnhsweb.onrender.com/api";

// Position labels
// const positionLabels: Record<string, string> = {
//   president: "President",
//   vicePresident: "Vice President",
//   secretary: "Secretary",
//   treasurer: "Treasurer",
//   auditor: "Auditor",
//   pio: "P.I.O.",
//   peaceOfficer: "Peace Officer",
// };

interface ElectionPeriod {
  id: string;
  label: string;
  date: string;
}

interface TallyResult {
  position: string;
  candidateId: string;
  candidateName: string;
  voteCount: number;
  team?: string;
}

interface VoterRecord {
  _id: string;
  voterId: string;
  electionId: string;
  fullName: string;
  gradeSection: string;
  lrn: string;
  email: string;
  votedAt: string;
  archivedAt: string;
  totalCandidatesVoted: number;
  electionTitle: string;
}

interface ElectionSummary {
  id: string;
  date: string;
  title: string;
  type: string;
  totalVotes: number;
  archivedVotes?: number;
  country?: string;
  flag?: string;
}

export const VoteHistory = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [periods, setPeriods] = useState<ElectionPeriod[]>([]);
  const [summaries, setSummaries] = useState<ElectionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [selectedElection, setSelectedElection] =
    useState<ElectionSummary | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Winners, 1 = Voters
  const [_detailedResults, setDetailedResults] = useState<TallyResult[]>([]);
  const [voterRecords, setVoterRecords] = useState<VoterRecord[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/election-periods`);
      if (!res.ok) throw new Error("Failed to fetch periods");
      const data = await res.json();
      setPeriods(data.periods || []);
    } catch (err) {
      console.error(err);
      setError("Could not load election history.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary + archived votes
  const fetchElectionSummary = async (
    period: ElectionPeriod // ← change from string to ElectionPeriod
  ): Promise<ElectionSummary> => {
    const electionId = period.id; // extract id here

    try {
      let totalVotes = 0;
      let archivedVotes = 0;

      // Try historical votes first
      const resHistory = await fetch(
        `${API_BASE}/admin/historical-votes/${electionId}`
      );
      if (resHistory.ok) {
        const history = await resHistory.json();
        archivedVotes = history.totalVotes || 0;
        totalVotes = archivedVotes;
      } else {
        // Fallback to current aggregate (for ongoing election)
        const resResults = await fetch(`${API_BASE}/admin/results`);
        if (resResults.ok) {
          const results = await resResults.json();
          totalVotes = results.reduce(
            (sum: number, r: any) => sum + r.voteCount,
            0
          );
        }
      }

      // Customize display based on electionId
      const titleMap: Record<
        string,
        { title: string; type: string; country?: string; flag?: string }
      > = {
        "election-2025-11": {
          title: "Midterm Elections (House & partial Senate)",
          type: "Midterm",
          country: "United States",
          flag: "🇺🇸",
        },
        "election-2025-06": {
          title: "Federal Election",
          type: "Federal",
          country: "Germany",
          flag: "🇩🇪",
        },
      };

      const info = titleMap[electionId] || {
        title: `Election ${electionId.replace("election-", "")}`,
        type: "General",
      };

      return {
        id: electionId,
        date: electionId.replace("election-", "").replace("-", "/"),
        title: info.title,
        type: info.type,
        totalVotes,
        archivedVotes,
        country: info.country,
        flag: info.flag,
      };
    } catch (err) {
      console.error(`Failed summary for ${electionId}:`, err);
      return {
        id: electionId,
        date: electionId.replace("election-", "").replace("-", "/"),
        title: `Election ${electionId.replace("election-", "")}`,
        type: "Unknown",
        totalVotes: 0,
        archivedVotes: 0,
      };
    }
  };

  useEffect(() => {
    const loadSummaries = async () => {
      if (periods.length === 0) return;
      setLoading(true);
      const all = await Promise.all(periods.map(fetchElectionSummary));
      setSummaries(all);
      setLoading(false);
    };
    loadSummaries();
  }, [periods]);

  const filteredSummaries = useMemo(() => {
    let data = [...summaries];
    if (startDate && isValid(parseISO(startDate))) {
      const filterDate = new Date(startDate);
      data = data.filter((el) => {
        const [year, month] = el.date.split("/").map(Number);
        return new Date(year, month - 1, 1) >= filterDate;
      });
    }
    return data.sort((a, b) => b.id.localeCompare(a.id));
  }, [summaries, startDate]);

  const stats = useMemo(() => {
    const total = filteredSummaries.reduce((s, e) => s + e.totalVotes, 0);
    const archived = filteredSummaries.reduce(
      (s, e) => s + (e.archivedVotes || 0),
      0
    );
    const count = filteredSummaries.length;
    return {
      total,
      archived,
      count,
      avg: count > 0 ? Math.round(total / count) : 0,
    };
  }, [filteredSummaries]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPeriods();
    setLoading(false);
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleRowClick = async (election: ElectionSummary) => {
    setSelectedElection(election);
    setTabValue(0); // default to Winners tab
    setDetailsLoading(true);

    try {
      // Fetch detailed winners (from results)
      const resResults = await fetch(`${API_BASE}/admin/results`);
      if (resResults.ok) {
        setDetailedResults(await resResults.json());
      }

      // Fetch voter list (historical votes)
      const resHistory = await fetch(
        `${API_BASE}/admin/historical-votes/${election.id}`
      );
      if (resHistory.ok) {
        const data = await resHistory.json();
        setVoterRecords(data.votes || []);
      } else {
        setVoterRecords([]);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
      setDetailedResults([]);
      setVoterRecords([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Vote History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full voter records & results • December 2025
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Votes
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.total.toLocaleString()}
                </Typography>
              </div>
              <PeopleIcon color="primary" sx={{ fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Typography variant="subtitle2" color="text.secondary">
                  Archived Votes
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.archived.toLocaleString()}
                </Typography>
              </div>
              <EventIcon color="success" sx={{ fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Typography variant="subtitle2" color="text.secondary">
                  Elections
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.count}
                </Typography>
              </div>
              <BarChartIcon
                color="secondary"
                sx={{ fontSize: 40, opacity: 0.7 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Filter Elections
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <TextField
            label="From"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 220, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={() => setStartDate("")}
            sx={{ minWidth: 100 }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white" }}>Date</TableCell>
                <TableCell sx={{ color: "white" }}>Election</TableCell>
                <TableCell sx={{ color: "white" }}>Type</TableCell>
                <TableCell align="right" sx={{ color: "white" }}>
                  Votes
                </TableCell>
                <TableCell align="right" sx={{ color: "white" }}>
                  Archived
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No elections found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSummaries.map((election) => (
                  <TableRow
                    key={election.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(election)}
                  >
                    <TableCell>
                      {format(
                        parseISO(`${election.date.replace("/", "-")}-01`),
                        "MMM yyyy"
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        {election.flag && (
                          <Typography variant="h6">{election.flag}</Typography>
                        )}
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {election.country || "Philippines"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {election.title}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={election.type}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {election.totalVotes.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {election.archivedVotes?.toLocaleString() || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, bgcolor: "action.hover", textAlign: "center" }}>
          Showing {filteredSummaries.length} of {summaries.length}
        </Box>
      </Paper>

      {/* Modal with Tabs: Winners & Voters */}
      <Modal
        open={!!selectedElection}
        onClose={() => setSelectedElection(null)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 800 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {selectedElection?.title} - Full Details
            </Typography>
            <IconButton onClick={() => setSelectedElection(null)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Voters List" />
          </Tabs>

          {detailsLoading ? (
            <CircularProgress />
          ) : (
            <>
              {tabValue === 0 && (
                <Box>
                  {voterRecords.length === 0 ? (
                    <Alert severity="info">
                      No voters recorded for this election yet.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Grade & Section</TableCell>
                            <TableCell>LRN</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Voted At</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {voterRecords.map((voter) => (
                            <TableRow key={voter._id}>
                              <TableCell>{voter.fullName}</TableCell>
                              <TableCell>{voter.gradeSection}</TableCell>
                              <TableCell>{voter.lrn}</TableCell>
                              <TableCell>{voter.email}</TableCell>
                              <TableCell>
                                {format(
                                  parseISO(voter.votedAt),
                                  "MMM d, yyyy - h:mm a"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default VoteHistory;
