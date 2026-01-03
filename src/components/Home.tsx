// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Fab,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CampaignIcon from "@mui/icons-material/Campaign";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://jolnhsweb.onrender.com/api";

// Scroll to Top Button (unchanged)
const ScrollTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Fab
            color="primary"
            size="large"
            onClick={scrollToTop}
            sx={{
              position: "fixed",
              bottom: { xs: 20, md: 40 },
              right: { xs: 20, md: 40 },
              zIndex: 1500,
              bgcolor: "#1e40af",
              "&:hover": { bgcolor: "#1e3a8a" },
            }}
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 32 }} />
          </Fab>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Position order & labels (unchanged)
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

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentWinners, setRecentWinners] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => setShowScrollDown(window.scrollY < 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // 1. Fetch Announcement (latest active)
        setLoadingAnnouncement(true);
        const annRes = await fetch(`${API_BASE}/announcement`);
        if (annRes.ok) {
          const annData = await annRes.json();
          setAnnouncement(annData.text?.trim() || "");
        }
        setLoadingAnnouncement(false);

        // 2. Fetch SSG Officers
        setLoadingOfficers(true);
        const winnersRes = await fetch(`${API_BASE}/admin/winners`);
        if (!winnersRes.ok) throw new Error("Failed to load SSG officers");
        const winnersData = await winnersRes.json();

        if (winnersData.winners?.length > 0) {
          const sorted = [...winnersData.winners].sort((a: any, b: any) => {
            const aIdx = positionOrder.findIndex(
              (p) =>
                positionLabels[p].toLowerCase() ===
                a.positionLabel.toLowerCase()
            );
            const bIdx = positionOrder.findIndex(
              (p) =>
                positionLabels[p].toLowerCase() ===
                b.positionLabel.toLowerCase()
            );
            return aIdx - bIdx;
          });
          setRecentWinners({ ...winnersData, winners: sorted });
        }
        setLoadingOfficers(false);
        setLoadingClubs(false);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        console.error("Home fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const heroImage = "public/bg.jfif"; // Make sure this file exists

  const clubs = [
    {
      name: "Sports Club",
      desc: "Develop strength, teamwork, and sportsmanship through basketball, volleyball, and athletics.",
      img: "https://www.dailybreeze.com/wp-content/uploads/2023/07/LDN-L-LEAGUE-0702-1.jpg",
    },
    {
      name: "Torch Club",
      desc: "Cultivate leadership and community service with meaningful projects and initiatives.",
      img: "https://redcross.org.ph/wp-content/uploads/2018/07/IMG_9770.jpg",
    },
    {
      name: "Tanglaw Club",
      desc: "Nurture spiritual growth and values formation through guidance activities.",
      img: "https://i.ytimg.com/vi/gzyEt6_7vz4/maxresdefault.jpg",
    },
    {
      name: "Art Club",
      desc: "Unleash creativity through drawing, painting, crafts, and artistic expression.",
      img: "https://tse3.mm.bing.net/th/id/OIP.JnyW-U-YDqnduvPITZZmoQHaGX?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      name: "Dance Troupe",
      desc: "Master folk, modern, and contemporary dance for performances and cultural events.",
      img: "https://npr.brightspotcdn.com/e9/c1/5cf95b654e47898837038e79bd91/img-7614.jpg",
    },
    {
      name: "Banda Club",
      desc: "Excel in marching band, drum corps, and musical performances.",
      img: "https://i.ytimg.com/vi/ju-of1DxZzo/maxresdefault.jpg",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "90vh", md: "100vh" },
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.55)" }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box textAlign="center" color="white">
            <SchoolIcon
              sx={{ fontSize: { xs: 80, md: 120 }, mb: 3, color: "#60a5fa" }}
            />
            <Typography
              variant={isMobile ? "h4" : "h2"}
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{ textShadow: "0 4px 12px rgba(0,0,0,0.7)" }}
            >
              Julia Ortiz Luis National High School
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                maxWidth: "900px",
                mx: "auto",
                mb: 6,
                lineHeight: 1.8,
                fontStyle: "italic",
                textShadow: "0 2px 8px rgba(0,0,0,0.7)",
              }}
            >
              Committed to quality, inclusive education in a safe environment,
              nurturing competent and values-driven learners.
            </Typography>
          </Box>
        </Container>

        {/* Scroll Down Indicator */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                position: "absolute",
                bottom: isMobile ? 40 : 80,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Typography variant="body2" color="white" fontWeight="bold">
                Scroll to explore
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 48, color: "white" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* === NEW: Announcement Banner (User-Friendly & Beautiful) === */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {loadingAnnouncement ? (
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 3, mb: 6 }}
          />
        ) : announcement ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Paper
              elevation={8}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                bgcolor: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
                border: "2px solid #ffb300",
                position: "relative",
                overflow: "hidden",
                mb: 8,
                boxShadow: "0 10px 40px rgba(255,179,0,0.2)",
              }}
            >
              {/* Subtle animated background */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 10% 20%, rgba(255,179,0,0.12) 0%, transparent 60%)",
                  animation: "pulse 8s infinite alternate",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.4 },
                    "100%": { opacity: 0.8 },
                  },
                }}
              />

              <Box
                sx={{ position: "relative", zIndex: 1, textAlign: "center" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <CampaignIcon sx={{ fontSize: 40, color: "#f57c00" }} />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      color: "#ef6c00",
                      textShadow: "0 2px 8px rgba(239,108,0,0.2)",
                    }}
                  >
                    School Announcement
                  </Typography>
                </Box>

                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.6,
                    maxWidth: "900px",
                    mx: "auto",
                  }}
                >
                  {announcement}
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        ) : null}
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* SSG Officers - Real Data */}
        <Box mb={{ xs: 12, md: 20 }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 0 20px rgba(0,212,255,0.5)",
            }}
          >
            Supreme Student Government (SSG)
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={6}>
            School Year 2025–2026 • Current Officers
          </Typography>

          {loadingOfficers ? (
            <Grid container spacing={4} justifyContent="center">
              {[...Array(7)].map(
                (
                  _,
                  i // 7 positions
                ) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                    <Skeleton
                      variant="rectangular"
                      height={280}
                      sx={{ borderRadius: 4 }}
                    />
                  </Grid>
                )
              )}
            </Grid>
          ) : error ? (
            <Alert
              severity="error"
              sx={{ textAlign: "center", py: 4, maxWidth: 600, mx: "auto" }}
            >
              {error}
            </Alert>
          ) : recentWinners && recentWinners.winners?.length > 0 ? (
            <>
              {/* Featured President */}
              {recentWinners.winners
                .filter((w: any) =>
                  w.positionLabel.toLowerCase().includes("president")
                )
                .slice(0, 1)
                .map((president: any) => (
                  <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    key="president-featured"
                  >
                    <Grid size={{ xs: 12, md: 10, lg: 8 }}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          elevation={12}
                          sx={{
                            borderRadius: 5,
                            overflow: "hidden",
                            border: "3px solid #1e40af",
                            boxShadow: "0 15px 50px rgba(30,58,138,0.25)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 25px 80px rgba(30,58,138,0.4)",
                              transform: "translateY(-8px)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                              p: { xs: 5, md: 8 },
                              bgcolor: "#f8fafc",
                              textAlign: "center",
                            }}
                          >
                            <EmojiEventsIcon
                              sx={{
                                fontSize: { xs: 70, md: 90 },
                                color: "#1e40af",
                                mb: 3,
                              }}
                            />
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="#1e40af"
                              gutterBottom
                            >
                              SSG President
                            </Typography>
                            <Typography
                              variant="h3"
                              fontWeight="900"
                              color="text.primary"
                              gutterBottom
                            >
                              {president.winnerName}
                            </Typography>
                            <Chip
                              label={president.winnerTeam || "Independent"}
                              color="primary"
                              size="medium"
                              sx={{
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                px: 5,
                                py: 1.5,
                                mb: 3,
                              }}
                            />
                            {president.votes && (
                              <Typography
                                variant="h6"
                                color="text.secondary"
                                mt={2}
                              >
                                {president.votes.toLocaleString()} votes •{" "}
                                {president.percentage}%
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  </Grid>
                ))}

              {/* All Other Officers - Strict Order */}
              <Grid
                container
                spacing={4}
                justifyContent="center"
                sx={{ mt: 6 }}
              >
                {positionOrder
                  .filter((pos) => pos !== "President")
                  .map((posKey) => {
                    const officer = recentWinners.winners.find(
                      (w: any) =>
                        w.positionLabel.toLowerCase() ===
                        positionLabels[posKey].toLowerCase()
                    );

                    if (!officer) return null;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={posKey}>
                        <motion.div
                          whileHover={{ y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            elevation={6}
                            sx={{
                              height: "100%",
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid rgba(30,58,138,0.2)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 15px 40px rgba(30,58,138,0.3)",
                                transform: "translateY(-8px)",
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: 4,
                                textAlign: "center",
                                bgcolor: "#f8fafc",
                              }}
                            >
                              <EmojiEventsIcon
                                sx={{ fontSize: 40, color: "#3b82f6", mb: 2 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="#1e40af"
                                gutterBottom
                              >
                                {officer.positionLabel}
                              </Typography>
                              <Typography
                                variant="h5"
                                fontWeight="700"
                                color="text.primary"
                                gutterBottom
                              >
                                {officer.winnerName}
                              </Typography>
                              <Chip
                                label={officer.winnerTeam || "Independent"}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                              />
                              {officer.votes && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {officer.votes.toLocaleString()} votes •{" "}
                                  {officer.percentage}%
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
              </Grid>
            </>
          ) : (
            <Alert
              severity="info"
              sx={{ textAlign: "center", py: 6, maxWidth: 800, mx: "auto" }}
            >
              No elected officers recorded yet for this school year.
            </Alert>
          )}
        </Box>

        {/* Clubs Section */}
        <Box mt={{ xs: 12, md: 20 }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 0 20px rgba(0,212,255,0.5)",
            }}
          >
            Unlock Your Passion – Join Our Clubs!
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={8}>
            Level up your skills, make friends, and create memories!
          </Typography>

          {loadingClubs ? (
            <Grid container spacing={4}>
              {[...Array(6)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={340}
                    sx={{ borderRadius: 6 }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {clubs.map((club) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={club.name}>
                  <motion.div
                    whileHover={{ y: -15, scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 6,
                        overflow: "hidden",
                        position: "relative",
                        bgcolor: "background.paper",
                        border: "2px solid transparent",
                        background: "linear-gradient(145deg, #1e293b, #111827)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        "&:hover": {
                          border: "2px solid #00d4ff",
                          boxShadow: "0 25px 80px rgba(0,212,255,0.3)",
                          transform: "translateY(-15px)",
                        },
                      }}
                    >
                      {/* Neon Glow Overlay on Hover */}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, transparent 70%)",
                          opacity: 0,
                          transition: "opacity 0.5s",
                          pointerEvents: "none",
                          "&:hover": { opacity: 1 },
                        }}
                      />

                      <CardMedia
                        component="img"
                        height="240"
                        image={club.img}
                        alt={club.name}
                        sx={{
                          objectFit: "cover",
                          filter: "brightness(0.9)",
                          transition: "all 0.4s",
                          "&:hover": {
                            filter: "brightness(1.1) saturate(1.2)",
                          },
                        }}
                      />

                      <CardContent
                        sx={{
                          p: 4,
                          textAlign: "center",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            color: "#00d4ff",
                            mb: 2,
                            textShadow: "0 0 10px rgba(0,212,255,0.5)",
                          }}
                        >
                          {club.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={3}
                          sx={{ lineHeight: 1.7 }}
                        >
                          {club.desc}
                        </Typography>

                        {/* Game-Style Join Button */}
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            size="medium"
                            component={Link}
                            to="/register-club"
                            sx={{
                              bgcolor: "#7c3aed",
                              color: "white",
                              fontWeight: "bold",
                              px: 5,
                              py: 1.2,
                              borderRadius: 50,
                              boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                              "&:hover": {
                                bgcolor: "#6d28d9",
                                boxShadow: "0 0 30px rgba(124,58,237,0.7)",
                              },
                            }}
                          >
                            Join Now
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" mt={12}>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register-club"
                sx={{
                  bgcolor: "#00d4ff",
                  color: "#0f172a",
                  fontWeight: "bold",
                  fontSize: "1.4rem",
                  px: 10,
                  py: 2,
                  borderRadius: 50,
                  boxShadow: "0 0 40px rgba(0,212,255,0.5)",
                  "&:hover": {
                    bgcolor: "#00b8d9",
                    boxShadow: "0 0 60px rgba(0,212,255,0.7)",
                  },
                }}
              >
                Start Your Club Adventure Today!
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>

      <ScrollTopButton />
    </>
  );
};

export default Home;
