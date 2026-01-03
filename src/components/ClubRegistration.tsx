import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";

const clubs = [
  {
    value: "sports",
    label: "Sports Club",
    desc: "Basketball, volleyball, athletics – develop teamwork and fitness!",
    img: "https://www.dailybreeze.com/wp-content/uploads/2023/07/LDN-L-LEAGUE-0702-1.jpg",
  },
  {
    value: "torch",
    label: "Torch Club",
    desc: "Leadership and community service activities.",
    img: "https://redcross.org.ph/wp-content/uploads/2018/07/IMG_9770.jpg",
  },
  {
    value: "tanglaw",
    label: "Tanglaw Club",
    desc: "Guidance and values formation for students.",
    img: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122172065942470629",
  },
  {
    value: "art",
    label: "Art Club",
    desc: "Drawing, painting, and creative arts.",
    img: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=4884468678445468",
  },
  {
    value: "dance",
    label: "Dance Club",
    desc: "Folk dance, modern, and performance arts.",
    img: "https://npr.brightspotcdn.com/e9/c1/5cf95b654e47898837038e79bd91/img-7614.jpg",
  },
  {
    value: "banda",
    label: "Banda Club (Drum & Lyre)",
    desc: "Marching band, drum corps, and musical performances.",
    img: "https://i.ytimg.com/vi/6rLgX12Vvng/maxresdefault.jpg",
  },
];

const BACKEND_URL = "https://jolnhsweb.onrender.com"; // Change to production URL later

const ClubRegistration: React.FC = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    gradeSection: "",
    contactNumber: "",
    lrn: "",
    email: "",
  });

  const [selectedClub, setSelectedClub] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navbarHeight = isMobile ? 64 : 80;
  const extraDesktopMargin = isMobile ? 0 : 24;
  const topOffset = navbarHeight + extraDesktopMargin;

  const steps = ["Verify Email", "Registration Details", "Confirmation"];

  const handleSendVerification = async () => {
    if (!email.includes("@") || !email.endsWith("@gmail.com")) {
      setVerificationError("Please use a valid Gmail address (@gmail.com)");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/club/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send code");
      }

      setVerificationSent(true);
    } catch (err: any) {
      setVerificationError(err.message || "Network error. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/club/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (!res.ok) {
        throw new Error("Invalid or expired code");
      }

      setFormData((prev) => ({ ...prev, email }));
      setStep(1);
      setVerificationError("");
    } catch (err: any) {
      setVerificationError(err.message || "Verification failed.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errors.fullName = "Required";
    if (!formData.gradeSection.trim()) errors.gradeSection = "Required";
    if (!formData.contactNumber || formData.contactNumber.length < 10)
      errors.contactNumber = "Valid 10+ digit number required";
    if (!formData.lrn || formData.lrn.length !== 12)
      errors.lrn = "Valid 12-digit LRN required";
    if (!selectedClub) errors.club = "Please select a club";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/club/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          gradeSection: formData.gradeSection,
          contactNumber: formData.contactNumber,
          lrn: formData.lrn,
          email: formData.email,
          club: selectedClub,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Registration failed");
      }

      setStep(2);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClubData = clubs.find((c) => c.value === selectedClub);

  return (
    <Box sx={{ pt: `${topOffset}px`, bgcolor: "#f8f9ff", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={12}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: "white",
            boxShadow: "0 10px 30px rgba(30,58,138,0.15)",
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            align="center"
            color="#1e3a8a"
            fontWeight="bold"
            sx={{ mb: 4 }}
          >
            Club Registration Portal
          </Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 8 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Email Verification */}
          {step === 0 && (
            <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center" }}>
              <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                color="#1e3a8a"
              >
                Step 1: Verify Your Email
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Enter your Gmail address to receive a verification code
              </Typography>

              <TextField
                label="Your Gmail Address"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!verificationError}
                helperText={verificationError || "We'll send a 6-digit code"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              {!verificationSent ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleSendVerification}
                  disabled={isVerifying || !email.includes("@gmail.com")}
                  sx={{ py: 1.5, borderRadius: 50 }}
                >
                  {isVerifying ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              ) : (
                <>
                  <TextField
                    label="Enter 6-digit Code"
                    fullWidth
                    variant="outlined"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    sx={{ mb: 4 }}
                    inputProps={{ maxLength: 6 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleVerifyCode}
                    sx={{ py: 1.5, borderRadius: 50 }}
                  >
                    Verify & Continue
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Step 2: Registration Form */}
          {step === 1 && (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                color="#1e3a8a"
                sx={{ mb: 4 }}
              >
                Step 2: Registration Details
              </Typography>

              <Box
                sx={{
                  mb: 4,
                  p: 2,
                  bgcolor: "rgba(30,58,138,0.08)",
                  borderRadius: 2,
                  border: "1px solid rgba(30,58,138,0.15)",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Verified Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.email}
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Grade & Section"
                    fullWidth
                    required
                    name="gradeSection"
                    value={formData.gradeSection}
                    onChange={handleInputChange}
                    error={!!formErrors.gradeSection}
                    helperText={
                      formErrors.gradeSection || "e.g., Grade 10 - Humility"
                    }
                    sx={{ mt: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Learner Reference Number (LRN)"
                    fullWidth
                    required
                    name="lrn"
                    value={formData.lrn}
                    onChange={handleInputChange}
                    error={!!formErrors.lrn}
                    helperText={
                      formErrors.lrn || "12-digit LRN (e.g., 123456789012)"
                    }
                    sx={{ mt: 3 }}
                    inputProps={{ maxLength: 12 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Contact Number"
                    fullWidth
                    required
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    error={!!formErrors.contactNumber}
                    helperText={formErrors.contactNumber || "09XX-XXX-XXXX"}
                    type="tel"
                    sx={{ mt: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl
                    fullWidth
                    required
                    error={!!formErrors.club}
                    sx={{ mt: 3 }}
                  >
                    <InputLabel>Club to Join</InputLabel>
                    <Select
                      value={selectedClub}
                      label="Club to Join"
                      onChange={(e) =>
                        setSelectedClub(e.target.value as string)
                      }
                    >
                      {clubs.map((club) => (
                        <MenuItem key={club.value} value={club.value}>
                          {club.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.club && (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ mt: 1 }}
                      >
                        {formErrors.club}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {selectedClub && selectedClubData && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={8}
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={selectedClubData.img}
                        alt={selectedClubData.label}
                        sx={{
                          height: { xs: 220, md: 280 },
                          objectFit: "cover",
                        }}
                      />
                      <CardContent>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="#1e3a8a"
                        >
                          {selectedClubData.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {selectedClubData.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {submitError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {submitError}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  mt: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 50,
                  boxShadow: "0 8px 20px rgba(30,58,138,0.3)",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Application"
                )}
              </Button>
            </Box>
          )}

          {/* STEP 3: PENDING REVIEW (Updated Message) */}
          {step === 2 && selectedClubData && (
            <Box sx={{ textAlign: "center", maxWidth: 600, mx: "auto" }}>
              <Alert
                severity="info" // Blue/info para malinaw na pending pa
                icon={false}
                sx={{
                  p: 5,
                  borderRadius: 3,
                  bgcolor: "#e3f2fd",
                  border: "1px solid #90caf9",
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Application Submitted!
                </Typography>

                <Divider sx={{ my: 3, width: "60%", mx: "auto" }} />

                <Box sx={{ my: 3 }}>
                  <Typography variant="h6" color="text.primary">
                    Thank you, <strong>{formData.fullName}</strong>!
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Your application to join
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {selectedClubData.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                    sx={{ mt: 2 }}
                  >
                    Status: Pending Review
                  </Typography>
                </Box>

                <Box sx={{ my: 3, p: 2, bgcolor: "white", borderRadius: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Your Details
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    Email: {formData.email}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    LRN: {formData.lrn}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  The club adviser will review your application soon. You will
                  receive an email notification once your application is
                  approved or if further information is needed.
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 3, fontStyle: "italic" }}
                >
                  Thank you for your patience!
                </Typography>
              </Alert>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ClubRegistration;
