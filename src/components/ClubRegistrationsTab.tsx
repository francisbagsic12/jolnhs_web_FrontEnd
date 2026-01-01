// src/admin/components/ClubRegistrationsTab.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  Card,
  Chip,
  Box,
  IconButton,
  alpha,
  Modal,
  TextField,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Skeleton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import RefreshIcon from "@mui/icons-material/Refresh"; // ← NEW: Refresh icon
import { styled } from "@mui/material/styles";
import CardMedia from "@mui/material/CardMedia";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const BACKEND_URL = "http://localhost:5000";

const NeonCard = styled(Card)(({ theme }) => ({
  background: "rgba(15, 23, 42, 0.75)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(59, 130, 246, 0.25)",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  cursor: "pointer",
  position: "relative", // for absolute refresh button
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)",
    borderColor: "rgba(59, 130, 246, 0.6)",
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 1300,
  maxHeight: "92vh",
  overflow: "hidden",
  background: "rgba(15, 23, 42, 0.95)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(59, 130, 246, 0.5)",
  borderRadius: 24,
  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7)",
  padding: theme.spacing(5),
  outline: "none",
  display: "flex",
  flexDirection: "column",
}));

interface Student {
  id: string;
  lrn: string;
  name: string;
  section: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  club: string;
}

interface Club {
  value: string;
  label: string;
  desc: string;
  img: string;
}

const AVAILABLE_CLUBS: Club[] = [
  {
    value: "sports",
    label: "Sports Club",
    desc: "Basketball, volleyball, athletics",
    img: "https://www.dailybreeze.com/wp-content/uploads/2023/07/LDN-L-LEAGUE-0702-1.jpg",
  },
  {
    value: "torch",
    label: "Torch Club",
    desc: "Leadership & community service",
    img: "https://redcross.org.ph/wp-content/uploads/2018/07/IMG_9770.jpg",
  },
  {
    value: "tanglaw",
    label: "Tanglaw Club",
    desc: "Guidance and values formation",
    img: "https://i.ytimg.com/vi/gzyEt6_7vz4/maxresdefault.jpg",
  },
  {
    value: "art",
    label: "Art Club",
    desc: "Drawing, painting, creative arts",
    img: "https://tse3.mm.bing.net/th/id/OIP.JnyW-U-YDqnduvPITZZmoQHaGX?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    value: "dance",
    label: "Dance Club",
    desc: "Folk, modern & performance dance",
    img: "https://npr.brightspotcdn.com/e9/c1/5cf95b654e47898837038e79bd91/img-7614.jpg",
  },
  {
    value: "banda",
    label: "Banda Club",
    desc: "Drum & Lyre / Marching band",
    img: "https://i.ytimg.com/vi/6rLgX12Vvng/maxresdefault.jpg",
  },
];

const ClubRegistrationsTab: React.FC = () => {
  const [registrations, setRegistrations] = useState<Record<string, Student[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClub, setSelectedClub] = useState<
    | (Club & {
        students: Student[];
        registeredCount: number;
        pendingCount: number;
      })
    | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    studentId: string | null;
    action: "approved" | "rejected" | null;
  }>({ open: false, studentId: null, action: null });

  const [processingId, setProcessingId] = useState<string | null>(null); // NEW: Prevent double clicks

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const res = await fetch(`${BACKEND_URL}/api/admin/club-registrations`);
      if (!res.ok) throw new Error("Failed to load data");

      const data = await res.json();

      const grouped: Record<string, Student[]> = {};
      data.forEach((reg: any) => {
        const clubValue = reg.club;
        if (!grouped[clubValue]) grouped[clubValue] = [];

        grouped[clubValue].push({
          id: reg._id,
          lrn: reg.lrn || "N/A",
          name: reg.fullName,
          section: reg.gradeSection,
          email: reg.email,
          status: reg.status,
          appliedAt: new Date(reg.appliedAt).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          club: clubValue,
        });
      });

      setRegistrations(grouped);

      if (!silent) {
        setSnackbar({
          open: true,
          message: "Data refreshed successfully!",
          severity: "success",
        });
      }
    } catch (err: any) {
      setError(err.message);
      if (!silent) {
        setSnackbar({
          open: true,
          message: "Failed to refresh: " + err.message,
          severity: "error",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clubs = useMemo(() => {
    return AVAILABLE_CLUBS.map((club) => {
      const students = registrations[club.value] || [];
      const registeredCount = students.filter(
        (s) => s.status === "approved"
      ).length;
      const pendingCount = students.filter(
        (s) => s.status === "pending"
      ).length;

      return {
        ...club,
        registeredCount,
        pendingCount,
        students,
      };
    });
  }, [registrations]);

  const handleOpen = (club: (typeof clubs)[number]) => {
    setSelectedClub(club);
    setSearchTerm("");
    setActiveTab(club.pendingCount > 0 ? 1 : 0);
  };

  const handleClose = () => {
    setSelectedClub(null);
    setSearchTerm("");
  };

  const handleAction = (studentId: string, action: "approved" | "rejected") => {
    setConfirmDialog({ open: true, studentId, action });
  };

  const confirmAction = async () => {
    if (!selectedClub || !confirmDialog.studentId || !confirmDialog.action)
      return;

    const studentId = confirmDialog.studentId;
    const action = confirmDialog.action;

    setProcessingId(studentId); // Show loading on button
    setConfirmDialog({ open: false, studentId: null, action: null });

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/club-registration/${studentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status");
      }

      // IMMEDIATE LOCAL UPDATE (super fast UI response)
      setRegistrations((prev) => {
        const updated = { ...prev };
        if (updated[selectedClub.value]) {
          updated[selectedClub.value] = updated[selectedClub.value].map((s) =>
            s.id === studentId ? { ...s, status: action } : s
          );
        }
        return updated;
      });

      // Optional: silent full refresh after 1 second for consistency
      setTimeout(() => fetchData(true), 1000);

      setSnackbar({
        open: true,
        message: `Successfully ${
          action === "approved" ? "approved" : "rejected"
        }!`,
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to update: " + err.message,
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };
  const filteredStudents = useMemo(() => {
    if (!selectedClub) return [];

    const tabFilter = activeTab === 0 ? "approved" : "pending";
    let students = selectedClub.students.filter((s) => s.status === tabFilter);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.lrn.includes(term) ||
          s.section.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
      );
    }

    return students;
  }, [selectedClub, activeTab, searchTerm]);

  return (
    <>
      {/* Main View */}
      <Paper
        elevation={0}
        sx={{ background: "transparent", p: { xs: 2, md: 4 } }}
      >
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
            Club Registrations Dashboard
          </Typography>

          {/* Global Refresh Button */}
          <Tooltip title="Refresh all data">
            <IconButton
              color="primary"
              onClick={fetchData}
              disabled={loading}
              sx={{
                bgcolor: alpha("#60a5fa", 0.15),
                "&:hover": { bgcolor: alpha("#60a5fa", 0.3) },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 4,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} sx={{ height: 340, borderRadius: 20 }}>
                <Skeleton variant="rectangular" height="100%" />
              </Card>
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: { xs: 3, lg: 5 },
            }}
          >
            {clubs.map((club) => (
              <Tooltip key={club.value} title="Click to view details" arrow>
                <NeonCard onClick={() => handleOpen(club)}>
                  {/* Refresh button per card */}
                  {/* <Tooltip title="Refresh this club">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        fetchData();
                      }}
                      disabled={loading}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        color: "white",
                        bgcolor: alpha("#000", 0.4),
                        "&:hover": { bgcolor: alpha("#60a5fa", 0.6) },
                        zIndex: 10,
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip> */}

                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={club.img}
                      alt={club.label}
                      sx={{
                        objectFit: "cover",
                        filter: "brightness(0.8) contrast(1.1)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          color: "white",
                          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
                        }}
                      >
                        {club.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          maxWidth: "90%",
                        }}
                      >
                        {club.desc}
                      </Typography>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`${club.registeredCount} Approved`}
                          size="medium"
                          color="success"
                          variant={
                            club.registeredCount > 0 ? "filled" : "outlined"
                          }
                          sx={{
                            backgroundColor:
                              club.registeredCount > 0
                                ? alpha("#4caf50", 0.9)
                                : "transparent",
                            color: "white",
                          }}
                        />
                        <Chip
                          icon={<PendingActionsIcon />}
                          label={`${club.pendingCount} Pending`}
                          size="medium"
                          color="warning"
                          variant={
                            club.pendingCount > 0 ? "filled" : "outlined"
                          }
                          sx={{
                            backgroundColor:
                              club.pendingCount > 0
                                ? alpha("#ff9800", 0.9)
                                : "transparent",
                            color: "white",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </NeonCard>
              </Tooltip>
            ))}
          </Box>
        )}
      </Paper>

      {/* MODAL */}
      <Modal open={!!selectedClub} onClose={handleClose}>
        <ModalContent>
          {selectedClub && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {selectedClub.label}
                </Typography>

                <Box>
                  {/* Refresh button inside modal */}
                  <Tooltip title="Refresh this club data">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchData();
                      }}
                      disabled={loading}
                      sx={{ color: "white", mr: 1 }}
                    >
                      {loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    onClick={handleClose}
                    size="large"
                    sx={{ color: "white" }}
                  >
                    <CloseIcon fontSize="large" />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.25)", mb: 4 }} />
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  mb: 4,
                  "& .MuiTab-root": {
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    minHeight: 48,
                  },
                  "& .Mui-selected": { color: "#60a5fa" },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#60a5fa",
                    height: 4,
                  },
                }}
              >
                <Tab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <CheckCircleIcon />
                      Approved Members ({selectedClub.registeredCount})
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <PendingActionsIcon />
                      Pending Review ({selectedClub.pendingCount})
                    </Box>
                  }
                />
              </Tabs>

              <TextField
                fullWidth
                placeholder={`Search ${
                  activeTab === 0 ? "approved members" : "pending applications"
                }...`}
                variant="outlined"
                size="medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {filteredStudents.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 12,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {searchTerm
                      ? "No results found"
                      : activeTab === 0
                      ? "No approved members yet"
                      : "No pending applications"}
                  </Typography>
                  <Typography variant="body1">
                    {searchTerm
                      ? "Try different search terms"
                      : activeTab === 0
                      ? "Approved members will appear here after review"
                      : "New applications will appear here for approval"}
                  </Typography>
                </Box>
              ) : (
                <TableContainer
                  sx={{ maxHeight: "60vh", overflow: "auto", borderRadius: 2 }}
                >
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            bgcolor: "rgba(30,41,59,0.8)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          LRN
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "rgba(30,41,59,0.8)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "rgba(30,41,59,0.8)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "rgba(30,41,59,0.8)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Grade & Section
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "rgba(30,41,59,0.8)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Applied At
                        </TableCell>
                        {activeTab === 1 && (
                          <TableCell
                            sx={{
                              bgcolor: "rgba(30,41,59,0.8)",
                              color: "white",
                              fontWeight: "bold",
                              width: 240,
                            }}
                          >
                            Action
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow
                          key={student.id}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                            },
                            transition: "background 0.2s",
                          }}
                        >
                          <TableCell sx={{ color: "white" }}>
                            {student.lrn}
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 500 }}>
                            {student.name}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <EmailIcon
                                fontSize="small"
                                sx={{ color: "#60a5fa" }}
                              />
                              {student.email}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {student.section}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {student.appliedAt}
                          </TableCell>
                          {activeTab === 1 && (
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1.5 }}>
                                <Tooltip title="Approve this application">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    startIcon={
                                      processingId === student.id ? (
                                        <CircularProgress
                                          size={16}
                                          color="inherit"
                                        />
                                      ) : (
                                        <CheckCircleIcon />
                                      )
                                    }
                                    disabled={processingId === student.id}
                                    onClick={() =>
                                      handleAction(student.id, "approved")
                                    }
                                  >
                                    Approve
                                  </Button>
                                </Tooltip>

                                <Tooltip title="Reject this application">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    startIcon={
                                      processingId === student.id ? (
                                        <CircularProgress
                                          size={16}
                                          color="error"
                                        />
                                      ) : null
                                    }
                                    disabled={processingId === student.id}
                                    onClick={() =>
                                      handleAction(student.id, "rejected")
                                    }
                                  >
                                    Reject
                                  </Button>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>
          {confirmDialog.action === "approved"
            ? "Approve Application?"
            : "Reject Application?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {confirmDialog.action === "approved" ? "approve" : "reject"} this
            application?
            {confirmDialog.action === "rejected" && (
              <Box
                component="span"
                sx={{ color: "error.main", fontWeight: "bold" }}
              >
                {" "}
                This action cannot be undone.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={confirmDialog.action === "approved" ? "success" : "error"}
            autoFocus
          >
            {confirmDialog.action === "approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ClubRegistrationsTab;
