import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Lock as LockIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { isAfter } from "date-fns";

const API_BASE = "https://jolnhsweb.onrender.com/api";

interface Candidate {
  _id?: string;
  electionId: string;
  position: string;
  candidateId: string;
  name: string;
  team: string; // ← important
  party?: string;
}
const POSITIONS = [
  { value: "president", label: "President" },
  { value: "vicePresident", label: "Vice President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "auditor", label: "Auditor" },
  { value: "pio", label: "P.I.O." },
  { value: "peaceOfficer", label: "Peace Officer" },
];

export const ElectionControlTab: React.FC = () => {
  const [status, setStatus] = useState<any>({
    isVotingActive: false,
    votingStart: null,
    votingEnd: null,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [teams, setTeams] = useState<string[]>([]); // Available teams

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [newCandidate, setNewCandidate] = useState({
    position: "president",
    team: "",
    candidateId: "",
    name: "",
  });

  const [newTeamName, setNewTeamName] = useState("");

  // Current time as minimum for date pickers
  const minDateTime = new Date().toISOString().slice(0, 16);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/election-status`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStatus(data);

      if (data.votingStart) {
        setStartDate(new Date(data.votingStart).toISOString().slice(0, 16));
      }
      if (data.votingEnd) {
        setEndDate(new Date(data.votingEnd).toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/candidates`);
      if (!res.ok) throw new Error();
      const data: Candidate[] = await res.json(); // ← type assertion here
      setCandidates(data || []);

      // Now TypeScript knows c.team is string
      const uniqueTeams = [
        ...new Set(
          data.map((c) => c.team).filter((team): team is string => !!team) // type guard
        ),
      ];
      setTeams(uniqueTeams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStatus();
    fetchCandidates();
  }, []);

  const hasCandidates = candidates.length > 0;
  const isVotingActive = status.isVotingActive;

  const handleAddTeam = () => {
    const trimmed = newTeamName.trim();
    if (!trimmed) return;
    if (teams.includes(trimmed)) {
      alert("This team name already exists!");
      return;
    }

    setTeams((prev) => [...prev, trimmed]);
    setNewCandidate((prev) => ({ ...prev, team: trimmed }));
    setNewTeamName("");
  };

  const handleStartVoting = async () => {
    if (!startDate || !endDate) {
      return alert("Please set both start and end dates & times.");
    }
    if (!isAfter(new Date(endDate), new Date(startDate))) {
      return alert("End date must be after start date.");
    }
    if (!hasCandidates) {
      return alert("You must add at least one candidate first!");
    }

    const confirmMsg = `START NEW ELECTION?\n\nThis will:\n• Reset all votes\n• Allow all students to vote again\n• Lock candidate list\n• Start from ${startDate} to ${endDate}\n\nContinue?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/set-voting-period`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: startDate, end: endDate }),
      });

      if (res.ok) {
        alert("New election started successfully!");
        fetchStatus();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to start election.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopVoting = async () => {
    if (!confirm("End current voting session now? This cannot be undone."))
      return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stop-voting`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Voting stopped successfully!");
        fetchStatus();
      } else {
        alert("Failed to stop voting.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.candidateId.trim() || !newCandidate.name.trim()) {
      return alert("Candidate ID and Full Name are required.");
    }
    if (!newCandidate.team) {
      return alert("Please select or create a team first.");
    }
    if (isVotingActive) {
      return alert("Cannot add candidates while voting is active.");
    }

    setActionLoading(true);
    try {
      const payload = {
        ...newCandidate,
        team: newCandidate.team.trim(),
      };

      const res = await fetch(`${API_BASE}/admin/candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Candidate added successfully!");
        setNewCandidate({
          position: newCandidate.position,
          team: newCandidate.team, // keep last selected team
          candidateId: "",
          name: "",
        });
        fetchCandidates();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add candidate (duplicate ID?)");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (candidateId: string) => {
    if (isVotingActive) return alert("Cannot delete during active voting.");
    if (!confirm("Delete this candidate permanently?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/candidate/${candidateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Candidate deleted.");
        fetchCandidates();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        {/* Election Control Panel */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary.dark"
              gutterBottom
            >
              Election Control
            </Typography>

            <Alert
              severity={isVotingActive ? "success" : "warning"}
              sx={{ mb: 3 }}
            >
              Status: <strong>{isVotingActive ? "ACTIVE" : "INACTIVE"}</strong>
            </Alert>

            {!hasCandidates && !isVotingActive && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
                Add candidates first before starting election
              </Alert>
            )}

            {isVotingActive && (
              <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
                Candidate list is locked during active voting
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Voting Start"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: minDateTime }}
                  disabled={isVotingActive}
                  helperText="Future date & time only"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Voting End"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: startDate || minDateTime }}
                  disabled={isVotingActive}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Tooltip
                title={!hasCandidates ? "Add at least one candidate first" : ""}
              >
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartVoting}
                    disabled={isVotingActive || actionLoading || !hasCandidates}
                  >
                    {actionLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Start Election"
                    )}
                  </Button>
                </span>
              </Tooltip>

              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopVoting}
                disabled={!isVotingActive || actionLoading}
              >
                {actionLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  "End Voting Now"
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Candidate Management */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary.dark"
              gutterBottom
            >
              Manage Candidates ({candidates.length})
            </Typography>

            {isVotingActive ? (
              <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
                Management locked during active voting
              </Alert>
            ) : (
              <Box sx={{ mb: 4 }}>
                {/* Team Section */}
                <Box sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2, mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <GroupIcon color="primary" /> Team Management
                  </Typography>

                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        label="Create New Team"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g. Team Blue, Team Innovators"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<AddIcon />}
                        onClick={handleAddTeam}
                        disabled={
                          !newTeamName.trim() ||
                          teams.includes(newTeamName.trim())
                        }
                        fullWidth
                      >
                        Add Team
                      </Button>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel required>Select Team</InputLabel>
                      <Select
                        value={newCandidate.team}
                        label="Select Team"
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            team: e.target.value as string,
                          })
                        }
                        required
                      >
                        <MenuItem value="" disabled>
                          -- Select or create a team --
                        </MenuItem>
                        {teams.map((team) => (
                          <MenuItem key={team} value={team}>
                            {team}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Candidate Form */}
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Position</InputLabel>
                      <Select
                        value={newCandidate.position}
                        label="Position"
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            position: e.target.value as string,
                          })
                        }
                      >
                        {POSITIONS.map((pos) => (
                          <MenuItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Candidate ID"
                      value={newCandidate.candidateId}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          candidateId: e.target.value.trim(),
                        })
                      }
                      fullWidth
                      size="small"
                      placeholder="e.g. pres-blue-01"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Full Name"
                      value={newCandidate.name}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          name: e.target.value,
                        })
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 1 }}>
                    <Tooltip
                      title={
                        !newCandidate.team
                          ? "Select team first"
                          : "Add candidate"
                      }
                    >
                      <span>
                        <IconButton
                          color="primary"
                          onClick={handleAddCandidate}
                          disabled={
                            actionLoading ||
                            isVotingActive ||
                            !newCandidate.team
                          }
                          size="large"
                        >
                          <AddIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Candidates List */}
            {loading ? (
              <Box textAlign="center" py={6}>
                <CircularProgress />
              </Box>
            ) : candidates.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No candidates yet. Create a team and add candidates above.
              </Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 420, mt: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell>Team</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidates.map((c) => (
                      <TableRow key={c.candidateId} hover>
                        <TableCell>
                          <Chip
                            label={c.team || "—"}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {POSITIONS.find((p) => p.value === c.position)
                            ?.label || c.position}
                        </TableCell>
                        <TableCell>{c.candidateId}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(c.candidateId)}
                            disabled={isVotingActive || actionLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
