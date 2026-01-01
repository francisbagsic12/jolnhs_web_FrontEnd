import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Modal,
  Fade,
  Chip,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Zoom,
} from "@mui/material";
import {
  Close as CloseIcon,
  HowToVote as HowToVoteIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  EmojiEvents as EmojiEventsIcon,
  // Info as InfoIcon,
} from "@mui/icons-material";

const API_BASE = "https://jolnhsweb.onrender.com/api";

// Interfaces (same as before, but kept for completeness)
interface VotedStudent {
  id: string;
  name: string;
  grade: string;
  lrn: string;
  time: string;
  electionId?: string;
}

interface VoteDetails {
  [position: string]: string | null;
}

interface Candidate {
  _id?: string;
  electionId: string;
  position: string;
  candidateId: string;
  name: string;
  team: string;
  party?: string;
}

interface ElectionStatus {
  currentElectionId: string | null;
  isVotingActive: boolean;
  votingStart?: string;
  votingEnd?: string;
}

interface TallyResult {
  position: string;
  candidateId: string;
  candidateName: string;
  voteCount: number;
  team?: string;
}

const positionLabels: Record<string, string> = {
  president: "President",
  vicePresident: "Vice President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  auditor: "Auditor",
  pio: "P.I.O.",
  peaceOfficer: "Peace Officer",
};

export const VotingMonitorTab: React.FC = () => {
  const [votedStudents, setVotedStudents] = useState<VotedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  const [electionStatus, setElectionStatus] = useState<ElectionStatus>({
    currentElectionId: null,
    isVotingActive: false,
  });

  const [results, setResults] = useState<TallyResult[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<VotedStudent | null>(
    null
  );
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch functions (unchanged except better error handling)
  const fetchElectionStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/election-status`);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setElectionStatus(data);
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  const fetchVotedStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/admin/all-voted-students`);
      if (!res.ok) throw new Error("Failed to fetch voted students");
      const data = await res.json();
      let students: VotedStudent[] = data.students || [];

      // STRICTLY show only current election votes
      if (electionStatus.currentElectionId) {
        students = students.filter(
          (s) => s.electionId === electionStatus.currentElectionId
        );
      } else {
        students = []; // No current election → no votes shown
      }

      setVotedStudents(students);
      setTotalVotes(students.length);
    } catch (err) {
      setError("Failed to load voting records.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const res = await fetch(`${API_BASE}/admin/candidates`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data: Candidate[] = await res.json();
      setCandidates(data || []);
    } catch (err) {
      console.error("Candidates fetch error:", err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchVoteDetails = async (studentId: string) => {
    try {
      setModalLoading(true);
      const res = await fetch(`${API_BASE}/admin/vote-details/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch vote details");
      const data = await res.json();
      setVoteDetails(data.choices || {});
    } catch (err) {
      setVoteDetails({});
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      const res = await fetch(`${API_BASE}/admin/results`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data: TallyResult[] = await res.json();
      setResults(data);
    } catch (err) {
      setResults([]);
      console.error(err);
    } finally {
      setResultsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchElectionStatus();
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (electionStatus.currentElectionId) {
      fetchVotedStudents();
    }
  }, [electionStatus.currentElectionId, electionStatus.isVotingActive]);

  const handleOpenResults = async () => {
    await fetchResults();
    setResultsOpen(true);
  };

  const handleOpenModal = async (student: VotedStudent) => {
    setSelectedStudent(student);
    setOpenModal(true);
    await fetchVoteDetails(student.id);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedStudent(null);
    setVoteDetails(null);
  };

  // Maps for displaying names & teams
  const candidateNameMap = candidates.reduce<Record<string, string>>(
    (map, c) => {
      map[c.candidateId] = c.name;
      return map;
    },
    {}
  );

  const candidateTeamMap = candidates.reduce<Record<string, string>>(
    (map, c) => {
      map[c.candidateId] = c.team;
      return map;
    },
    {}
  );

  return (
    <>
      <Paper elevation={6} sx={{ borderRadius: 4, p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary.dark"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <HistoryIcon /> Voting Monitor
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={() => {
                fetchVotedStudents();
                fetchElectionStatus();
                fetchCandidates();
              }}
              disabled={loading}
              color="primary"
              size="large"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Election Status Alert */}
        <Alert
          severity={electionStatus.isVotingActive ? "info" : "success"}
          icon={
            electionStatus.isVotingActive ? (
              <HowToVoteIcon />
            ) : (
              <EmojiEventsIcon />
            )
          }
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {electionStatus.isVotingActive
            ? "Voting is currently ONGOING — Live monitoring active"
            : "Election has ENDED — Results are now final!"}
        </Alert>

        {/* Modern Notification when Election Ends */}
        {!electionStatus.isVotingActive && (
          <Zoom in={!electionStatus.isVotingActive}>
            <Alert
              severity="success"
              variant="filled"
              icon={<EmojiEventsIcon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleOpenResults}
                  startIcon={<EmojiEventsIcon />}
                >
                  View Official Results
                </Button>
              }
              sx={{
                mb: 4,
                borderRadius: 3,
                boxShadow: 3,
                fontSize: "1.1rem",
                py: 2,
              }}
            >
              <strong>ELECTION COMPLETED!</strong> All votes are now final.
              Congratulations to the winners!
            </Alert>
          </Zoom>
        )}

        {/* Voted Students Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">
            Students Who Voted{" "}
            {electionStatus.isVotingActive
              ? "This Election"
              : "in Current/Final Election"}
          </Typography>
          <Chip
            label={`${totalVotes} Vote${totalVotes === 1 ? "" : "s"}`}
            color="primary"
            size="medium"
            sx={{ fontWeight: "bold", fontSize: "1.3rem", height: 48, px: 3 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer
          sx={{
            maxHeight: 620,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Grade & Section
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  LRN
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Time Voted
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                    <CircularProgress size={70} thickness={4} />
                    <Typography sx={{ mt: 3, fontWeight: "medium" }}>
                      Loading current votes...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : votedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                    <Typography variant="h6" color="text.secondary">
                      {electionStatus.isVotingActive
                        ? "No votes recorded yet in the current election."
                        : "No votes in the final/current election period."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                votedStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    onClick={() => handleOpenModal(student)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f0f7ff" },
                    }}
                  >
                    <TableCell>
                      <strong>{student.name}</strong>
                    </TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.lrn}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={student.time} size="small" color="success" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Vote Details Modal (unchanged but kept for completeness) */}
      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: 580 },
              bgcolor: "background.paper",
              borderRadius: 4,
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
              <Typography variant="h5" fontWeight="bold" color="primary.dark">
                <HowToVoteIcon sx={{ mr: 1 }} /> Vote Details
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedStudent && (
              <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="h6">{selectedStudent.name}</Typography>
                <Typography color="text.secondary">
                  {selectedStudent.grade} • LRN: {selectedStudent.lrn}
                </Typography>
                <Typography color="text.secondary" fontSize="0.95rem">
                  Voted on: {selectedStudent.time}
                </Typography>
              </Box>
            )}

            {modalLoading || candidatesLoading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress size={60} />
                <Typography sx={{ mt: 2 }}>Loading vote details...</Typography>
              </Box>
            ) : voteDetails && Object.keys(voteDetails).length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Object.entries(voteDetails).map(([position, candidateId]) => {
                  const team = candidateId
                    ? candidateTeamMap[candidateId]
                    : null;
                  return (
                    <Box
                      key={position}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        color="primary.dark"
                        sx={{ minWidth: 160 }}
                      >
                        {positionLabels[position] || position}:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Chip
                          label={
                            candidateNameMap[candidateId || ""] ||
                            candidateId ||
                            "Abstain / No Vote"
                          }
                          color="primary"
                          variant="outlined"
                          size="medium"
                          sx={{ fontSize: "1rem", minWidth: 220 }}
                        />
                        {team && (
                          <Chip
                            label={`Team: ${team}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Alert severity="info">
                No vote details available for this student.
              </Alert>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Results Modal (unchanged) */}
      <Modal
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        closeAfterTransition
      >
        <Fade in={resultsOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", md: 900 },
              maxHeight: "90vh",
              bgcolor: "background.paper",
              borderRadius: 4,
              boxShadow: 24,
              p: 4,
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
              <Typography variant="h4" fontWeight="bold" color="primary.dark">
                <EmojiEventsIcon sx={{ fontSize: 50, mr: 2 }} />
                Official Election Results
              </Typography>
              <IconButton onClick={() => setResultsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Votes Cast: {totalVotes}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {resultsLoading ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <CircularProgress size={60} />
                <Typography sx={{ mt: 3 }}>Loading results...</Typography>
              </Box>
            ) : results.length === 0 ? (
              <Alert severity="info">No votes recorded yet.</Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {Object.entries(
                  results.reduce((acc: Record<string, TallyResult[]>, r) => {
                    if (!acc[r.position]) acc[r.position] = [];
                    acc[r.position].push(r);
                    return acc;
                  }, {})
                ).map(([position, candidates]) => {
                  const sorted = [...candidates].sort(
                    (a, b) => b.voteCount - a.voteCount
                  );
                  const maxVotes = sorted[0].voteCount;
                  const winners = sorted.filter(
                    (c) => c.voteCount === maxVotes
                  );

                  return (
                    <Card
                      key={position}
                      variant="outlined"
                      sx={{ borderRadius: 3 }}
                    >
                      <CardContent>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="primary.dark"
                          gutterBottom
                        >
                          {positionLabels[position] || position}
                        </Typography>

                        {winners.map((w, i) => (
                          <Box key={i} sx={{ mt: 2, textAlign: "center" }}>
                            <Typography variant="h4" fontWeight="bold">
                              {w.candidateName}
                            </Typography>
                            {w.team && (
                              <Chip
                                label={`Team: ${w.team}`}
                                color="secondary"
                                variant="outlined"
                                size="medium"
                                sx={{ mt: 1, mb: 1 }}
                              />
                            )}
                            <Chip
                              label={`${w.voteCount} vote${
                                w.voteCount !== 1 ? "s" : ""
                              }${winners.length > 1 ? " (Tie)" : ""}`}
                              color="success"
                              size="medium"
                              sx={{ mt: 1, fontSize: "1.2rem", py: 3 }}
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};
