import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  CircularProgress,
  Skeleton,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import EventIcon from "@mui/icons-material/Event";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const Vote: React.FC = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [fullName, setFullName] = useState("");
  const [gradeSection, setGradeSection] = useState("");
  const [lrn, setLrn] = useState("");

  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState("");

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [votingStatus, setVotingStatus] = useState<{
    currentElectionId: string | null;
    votingStart: string | null;
    votingEnd: string | null;
  }>({
    currentElectionId: null,
    votingStart: null,
    votingEnd: null,
  });

  const [votingState, setVotingState] = useState<
    "upcoming" | "active" | "ended"
  >("upcoming");
  const [countdown, setCountdown] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const topOffset = isMobile ? 64 : 104;

  const steps = ["Pag-verify", "Pagboto", "Kumpirmasyon"];

  const BACKEND_URL = "https://jolnhsweb.onrender.com/api";

  // =============================================
  //  Fetch election status (mas madalas na check)
  // =============================================
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/election-status`);
        if (!res.ok) throw new Error("Hindi ma-access ang status");
        const data = await res.json();
        setVotingStatus(data);

        const now = Date.now();
        const start = new Date(data.votingStart).getTime();
        const end = new Date(data.votingEnd).getTime();

        if (now < start) setVotingState("upcoming");
        else if (now <= end) setVotingState("active");
        else setVotingState("ended");
      } catch (err) {
        console.error(err);
        setGeneralError(
          "Hindi makakonekta sa server. Gamit ang huling alam na status."
        );
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // =============================================
  //  Real-time countdown & voting state
  // =============================================
  useEffect(() => {
    if (!votingStatus.votingStart || !votingStatus.votingEnd) return;

    const startTime = new Date(votingStatus.votingStart).getTime();
    const endTime = new Date(votingStatus.votingEnd).getTime();

    const update = () => {
      const now = Date.now();

      if (now < startTime) {
        const diff = startTime - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        setCountdown(
          `${d}d ${h.toString().padStart(2, "0")}h ${m
            .toString()
            .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
        );
        setVotingState("upcoming");
      } else if (now <= endTime) {
        setCountdown("BOTOHAN NGAYON!");
        setVotingState("active");
      } else {
        setCountdown("Tapos na ang botohan");
        setVotingState("ended");
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [votingStatus.votingStart, votingStatus.votingEnd]);

  // Auto-detect if voting ended while user is voting
  const checkVotingStillActive = useCallback(() => {
    if (votingState !== "active" && step === 1) {
      setGeneralError(
        "Natapos na ang botohan habang ikaw ay nagvo-vote. Hindi na maipapasa ang boto."
      );
      setStep(0);
      setFormData({});
      setVerificationCode("");
      setIsSubmitting(false);
    }
  }, [votingState, step]);

  useEffect(() => {
    checkVotingStillActive();
  }, [votingState, checkVotingStillActive]);

  // Fetch candidates
  useEffect(() => {
    if (step === 1 && votingState === "active") {
      const fetchCandidates = async () => {
        setCandidatesLoading(true);
        setCandidatesError("");
        try {
          const res = await fetch(`${BACKEND_URL}/admin/candidates`);
          if (!res.ok) throw new Error("Hindi ma-load ang mga kandidato");
          const data = await res.json();
          setCandidates(data);
        } catch (err: any) {
          setCandidatesError(err.message || "Error sa pag-load ng kandidato");
        } finally {
          setCandidatesLoading(false);
        }
      };
      fetchCandidates();
    }
  }, [step, votingState]);

  const isVotingActive = votingState === "active" && !hasVoted;

  // =============================================
  //  Handlers
  // =============================================
  const handleSendVerification = async () => {
    setVerificationError("");
    setGeneralError("");

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setVerificationError("Gamitin ang tamang Gmail (@gmail.com)");
      return;
    }

    if (!isVotingActive) {
      setVerificationError("Hindi na bukas ang botohan.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationSent(true);
      } else {
        setVerificationError(data.error || "Hindi maipadala ang code");
      }
    } catch {
      setVerificationError("May problema sa koneksyon");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerificationError("");

    if (verificationCode.length !== 6) {
      setVerificationError("Dapat eksaktong 6 digits ang code");
      return;
    }

    if (!fullName.trim() || !gradeSection.trim() || lrn.length !== 12) {
      setVerificationError("Kumpletuhin ang lahat ng impormasyon");
      return;
    }

    if (!isVotingActive) {
      setVerificationError("Tapos na ang botohan");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          code: verificationCode,
          fullName: fullName.trim(),
          gradeSection: gradeSection.trim(),
          lrn: lrn.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(1);
      } else {
        setVerificationError(data.error || "Mali ang verification code");
      }
    } catch {
      setVerificationError("May problema sa koneksyon");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isVotingActive) {
      setGeneralError("Tapos na ang botohan. Hindi na maipapasa ang boto.");
      setStep(0);
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const payload = {
        email: email.toLowerCase(),
        lrn: lrn.trim(),
        president: formData["president"] || null,
        vicePresident: formData["vicePresident"] || null,
        secretary: formData["secretary"] || null,
        treasurer: formData["treasurer"] || null,
        auditor: formData["auditor"] || null,
        pio: formData["pio"] || null,
        peaceOfficer: formData["peaceOfficer"] || null,
      };

      const res = await fetch(`${BACKEND_URL}/submit-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setHasVoted(true);
        setStep(2);
      } else {
        if (
          data.error?.toLowerCase().includes("voting") ||
          data.error?.includes("period")
        ) {
          setGeneralError(
            "Bigla nang natapos ang botohan. Hindi na naitala ang boto."
          );
          setStep(0);
        } else {
          setGeneralError(data.error || "Hindi ma-submit ang boto");
        }
      }
    } catch {
      setGeneralError("May problema sa koneksyon. Subukan ulit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const positions = [...new Set(candidates.map((c) => c.position))];
    const errors: Record<string, string> = {};

    positions.forEach((pos) => {
      if (!formData[pos]) {
        errors[pos] = "Kailangan pumili ng kandidato";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCandidateSelect = (position: string, candidateId: string) => {
    setFormData((prev) => ({ ...prev, [position]: candidateId }));
    setFormErrors((prev) => ({ ...prev, [position]: "" }));
  };

  const candidatesByPosition = candidates.reduce(
    (acc: Record<string, any[]>, cand: any) => {
      if (!acc[cand.position]) acc[cand.position] = [];
      acc[cand.position].push(cand);
      return acc;
    },
    {}
  );

  const positionLabels: Record<string, string> = {
    president: "President",
    vicePresident: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    auditor: "Auditor",
    pio: "P.I.O.",
    peaceOfficer: "Peace Officer",
  };

  return (
    <Box sx={{ pt: `${topOffset}px`, bgcolor: "#f5f7ff", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Paper elevation={10} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={5}>
            <HowToVoteIcon sx={{ fontSize: 70, color: "#1976d2", mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="#1976d2">
              JOLNHS SSG ELECTION 2025-2026
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              Bumoto nang matalino • Mahalaga ang iyong boses
            </Typography>
          </Box>

          {/* Status Banner */}
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 5,
              borderRadius: 3,
              bgcolor:
                votingState === "active"
                  ? "#e8f5e9"
                  : votingState === "upcoming"
                  ? "#fff3e0"
                  : "#ffebee",
              border: `2px solid ${
                votingState === "active"
                  ? "#4caf50"
                  : votingState === "upcoming"
                  ? "#ff9800"
                  : "#f44336"
              }`,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={3}
            >
              {votingState === "active" && (
                <EventIcon sx={{ fontSize: 50, color: "#4caf50" }} />
              )}
              {votingState === "upcoming" && (
                <AccessTimeIcon sx={{ fontSize: 50, color: "#ff9800" }} />
              )}
              {votingState === "ended" && (
                <LockIcon sx={{ fontSize: 50, color: "#f44336" }} />
              )}

              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold">
                  {votingState === "active"
                    ? "BUKAS ANG BOTOHAN!"
                    : votingState === "upcoming"
                    ? "Magbubukas Pa"
                    : "TAPOS NA ANG BOTOHAN"}
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {countdown}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0 - Verification */}
          {step === 0 && (
            <Box maxWidth={520} mx="auto">
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                color="#1976d2"
                fontWeight="bold"
              >
                Hakbang 1: Pag-verify ng Pagkakakilanlan
              </Typography>

              <TextField
                label="School Gmail Address"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                error={!!verificationError}
                helperText={verificationError || "Dapat @gmail.com"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                disabled={!isVotingActive || isVerifying}
              />

              {verificationSent && (
                <>
                  <TextField
                    label="Buong Pangalan"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.trim())}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Grade & Section"
                    fullWidth
                    value={gradeSection}
                    onChange={(e) => setGradeSection(e.target.value.trim())}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="LRN (12 digits)"
                    fullWidth
                    value={lrn}
                    onChange={(e) =>
                      setLrn(e.target.value.replace(/\D/g, "").slice(0, 12))
                    }
                    error={lrn.length !== 12}
                    helperText={
                      lrn.length !== 12 ? "Dapat eksaktong 12 digits" : ""
                    }
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    label="6-Digit Code"
                    fullWidth
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    helperText="Suriin ang Gmail mo"
                    sx={{ mb: 4 }}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleVerifyCode}
                    disabled={
                      !isVotingActive ||
                      verificationCode.length !== 6 ||
                      !fullName.trim() ||
                      !gradeSection.trim() ||
                      lrn.length !== 12
                    }
                    sx={{ py: 1.8 }}
                  >
                    I-verify at Mag-vote
                  </Button>
                </>
              )}

              {!verificationSent && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleSendVerification}
                  disabled={
                    !isVotingActive ||
                    isVerifying ||
                    !email.toLowerCase().endsWith("@gmail.com")
                  }
                  sx={{ py: 1.8, mt: 2 }}
                >
                  {isVerifying ? (
                    <CircularProgress size={28} />
                  ) : (
                    "Ipadala ang Code"
                  )}
                </Button>
              )}

              {!isVotingActive && votingState === "ended" && (
                <Alert severity="info" sx={{ mt: 4 }}>
                  Tapos na ang botohan. Salamat sa interes mo.
                </Alert>
              )}
            </Box>
          )}

          {/* Step 1 - Voting */}
          {step === 1 && (
            <Box component="form" onSubmit={handleSubmit}>
              {generalError && (
                <Alert severity="error" sx={{ mb: 4 }}>
                  {generalError}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom color="#1976d2">
                Iyong Impormasyon
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 3, mb: 5, bgcolor: "#f8faff" }}
              >
                <Typography>
                  <strong>Pangalan:</strong> {fullName}
                </Typography>
                <Typography>
                  <strong>Grade & Section:</strong> {gradeSection}
                </Typography>
                <Typography>
                  <strong>LRN:</strong> {lrn}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {email}
                </Typography>
              </Paper>

              <Typography
                variant="h5"
                gutterBottom
                color="#1976d2"
                fontWeight="bold"
              >
                Pumili ng Kandidato
              </Typography>

              {candidatesLoading && (
                <Box sx={{ mt: 4 }}>
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} height={140} sx={{ mb: 3 }} />
                  ))}
                </Box>
              )}

              {candidatesError && (
                <Alert severity="error" sx={{ mt: 4 }}>
                  {candidatesError}
                </Alert>
              )}

              {!candidatesLoading &&
                candidates.length === 0 &&
                !candidatesError && (
                  <Alert severity="warning" sx={{ mt: 4 }}>
                    Walang available na kandidato. Ipaalam sa admin.
                  </Alert>
                )}

              {!candidatesLoading &&
                candidates.length > 0 &&
                Object.keys(candidatesByPosition).map((position) => (
                  <FormControl
                    key={position}
                    component="fieldset"
                    sx={{ mt: 5, width: "100%" }}
                    error={!!formErrors[position]}
                  >
                    <FormLabel
                      component="legend"
                      sx={{
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      {positionLabels[position] || position}
                    </FormLabel>

                    <RadioGroup value={formData[position] || ""}>
                      {candidatesByPosition[position].map((cand: any) => (
                        <FormControlLabel
                          key={cand.candidateId}
                          value={cand.candidateId}
                          control={<Radio color="primary" />}
                          label={
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Typography fontWeight="medium">
                                {cand.name} {cand.party && `(${cand.party})`}
                              </Typography>
                              <Chip
                                icon={<GroupIcon fontSize="small" />}
                                label={`Team: ${cand.team}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ mt: 0.5, width: "fit-content" }}
                              />
                            </Box>
                          }
                          onChange={() =>
                            handleCandidateSelect(position, cand.candidateId)
                          }
                          sx={{ my: 1, alignItems: "flex-start" }}
                        />
                      ))}
                    </RadioGroup>

                    {formErrors[position] && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        {formErrors[position]}
                      </Typography>
                    )}
                  </FormControl>
                ))}

              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                fullWidth
                disabled={
                  isSubmitting ||
                  !isVotingActive ||
                  hasVoted ||
                  candidatesLoading ||
                  candidates.length === 0
                }
                sx={{ mt: 6, py: 2.5, fontSize: "1.3rem", fontWeight: "bold" }}
              >
                {isSubmitting ? (
                  <CircularProgress size={30} color="inherit" />
                ) : (
                  "Isumite ang Boto Ko"
                )}
              </Button>
            </Box>
          )}

          {/* Step 2 - Success */}
          {step === 2 && (
            <Box textAlign="center" py={10}>
              <CheckCircleIcon
                sx={{ fontSize: 140, color: "#4caf50", mb: 4 }}
              />
              <Typography
                variant="h4"
                color="#4caf50"
                fontWeight="bold"
                gutterBottom
              >
                Salamat sa Iyong Boto!
              </Typography>
              <Typography variant="h6" color="text.secondary" mt={2}>
                Matagumpay nang naitala ang iyong boto.
              </Typography>
              <Typography variant="body1" mt={3}>
                Ipapahayag ang opisyal na resulta sa lalong madaling panahon.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Vote;
