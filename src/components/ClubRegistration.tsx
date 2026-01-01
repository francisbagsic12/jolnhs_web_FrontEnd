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
  // Tooltip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

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

const ClubRegistration: React.FC = () => {
  const [step, setStep] = useState(0); // 0: Verify, 1: Form, 2: Success
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    gradeSection: "",
    contactNumber: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Navbar offset
  const navbarHeight = isMobile ? 64 : 80;
  const extraDesktopMargin = isMobile ? 0 : 24;
  const topOffset = navbarHeight + extraDesktopMargin;

  const steps = ["Verify Identity", "Fill Registration", "Confirmation"];

  const handleSendVerification = () => {
    //@deped.gov.ph  plalitan nyo nalang kung gusto nyo eto gamitin na ext

    if (!email.includes("@") || !email.endsWith("@gmail.com")) {
      setVerificationError(
        "Please use a valid school email (e.g., @gmail.com)."
      );
      return;
    }
    setIsVerifying(true);
    setVerificationError("");
    // Simulate sending code
    setTimeout(() => {
      setVerificationSent(true);
      setIsVerifying(false);
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123456") {
      // Simulated code
      setStep(1);
      setVerificationError("");
    } else {
      setVerificationError("Invalid code. Try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName) errors.fullName = "Required";
    if (!formData.gradeSection) errors.gradeSection = "Required";
    if (!formData.contactNumber || formData.contactNumber.length < 10)
      errors.contactNumber = "Valid contact number required";
    if (!selectedClub) errors.club = "Please select a club";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
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
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            paragraph
            sx={{ mb: 6, maxWidth: "80%", mx: "auto" }}
          >
            Join our vibrant clubs to explore your passions, build skills, and
            make lifelong friends!
          </Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 8 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Box sx={{ textAlign: "center", maxWidth: "sm", mx: "auto" }}>
              <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                color="#1e3a8a"
              >
                Step 1: Verify Your School Email
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Enter your DepEd school email to receive a verification code.
              </Typography>
              <TextField
                label="School Email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!verificationError}
                helperText={
                  verificationError ||
                  "e.g., student@juliaortizluisnhs.deped.gov.ph"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {!verificationSent ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleSendVerification}
                  disabled={isVerifying}
                  sx={{ mt: 4, py: 1.5, borderRadius: 50 }}
                >
                  {isVerifying ? <CircularProgress size={24} /> : "Send Code"}
                </Button>
              ) : (
                <>
                  <TextField
                    label="Verification Code"
                    fullWidth
                    variant="outlined"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    sx={{ mt: 3 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleVerifyCode}
                    sx={{ mt: 3, py: 1.5, borderRadius: 50 }}
                  >
                    Verify & Continue
                  </Button>
                </>
              )}
            </Box>
          )}

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
                  />
                  <TextField
                    label="Grade & Section"
                    fullWidth
                    required
                    sx={{ mt: 3 }}
                    name="gradeSection"
                    value={formData.gradeSection}
                    onChange={handleInputChange}
                    error={!!formErrors.gradeSection}
                    helperText={
                      formErrors.gradeSection || "e.g., Grade 10 - Humility"
                    }
                  />
                  <TextField
                    label="Contact Number"
                    fullWidth
                    required
                    sx={{ mt: 3 }}
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    error={!!formErrors.contactNumber}
                    helperText={formErrors.contactNumber}
                    type="tel"
                  />

                  <FormControl
                    fullWidth
                    required
                    sx={{ mt: 3 }}
                    error={!!formErrors.club}
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
                      sx={{ height: "100%", borderRadius: 4 }}
                    >
                      <CardMedia
                        component="img"
                        image={selectedClubData.img}
                        alt={selectedClubData.label}
                        sx={{ height: 300, objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="#1e3a8a"
                        >
                          {selectedClubData.label}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {selectedClubData.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{
                  mt: 8,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 50,
                  boxShadow: "0 8px 20px rgba(30,58,138,0.3)",
                  "&:hover": { boxShadow: "0 12px 30px rgba(30,58,138,0.4)" },
                }}
              >
                Complete Registration
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Alert severity="success" sx={{ mt: 4, p: 4, fontSize: "1.2rem" }}>
              <Typography variant="h6" fontWeight="bold">
                Registration Successful!
              </Typography>
              <Typography>
                Thank you, {formData.fullName}! You've successfully registered
                for the {selectedClubData?.label}. Club advisers will contact
                you soon.
              </Typography>
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ClubRegistration;
