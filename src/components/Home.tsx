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
  List,
  ListItem,
  ListItemText,
  Paper,
  Fab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Scroll to Top Button
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

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showScrollDown, setShowScrollDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => setShowScrollDown(window.scrollY < 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroImage = "public/bg.jfif";

  return (
    <>
      {/* Hero Section - Clean, Modern, Responsive */}
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
          overflow: "hidden",
        }}
      >
        {/* Darker overlay for better text readability */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
          }}
        />

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Box textAlign="center" color="white">
              <SchoolIcon sx={{ fontSize: { xs: 60, md: 100 }, mb: 3 }} />
              <Typography
                variant={isMobile ? "h4" : "h2"}
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}
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
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                A public secondary institution committed to quality, inclusive
                education in a safe and supportive environment, nurturing
                academically competent and values-driven learners.
              </Typography>
            </Box>
          </motion.div>
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
                bottom: isMobile ? 30 : 60,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Typography
                variant="body2"
                color="white"
                align="center"
                fontWeight="bold"
                mb={1}
              >
                Scroll to explore
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 48, color: "white" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Important Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: 4,
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Important Announcement
            </Typography>
            <Typography variant="h5" paragraph sx={{ my: 4 }}>
              Now Accepting Incoming Senior High School Students!
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ maxWidth: "800px", mx: "auto", mb: 5 }}
            >
              Offering <strong>Academic</strong> and{" "}
              <strong>Technical-Vocational-Livelihood (TVL)</strong> tracks to
              prepare students for higher education, employment, and success.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#1e40af",
                fontWeight: "bold",
                px: 6,
                py: 2,
                borderRadius: 8,
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  transform: "translateY(-3px)",
                },
              }}
            >
              Contact School Office
            </Button>
          </Paper>
        </motion.div>

        {/* SSG Officers */}
        <Box mt={{ xs: 10, md: 16 }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            color="#1e40af"
            gutterBottom
          >
            Supreme Student Government (SSG)
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={6}>
            School Year 2025–2026
          </Typography>

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    image="https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=455143769969094" // Keep if valid; replace with actual president photo
                    alt="SSG President"
                    sx={{ height: { xs: 300, md: 450 }, objectFit: "cover" }}
                  />
                  <CardContent
                    sx={{
                      bgcolor: "#1e40af",
                      color: "white",
                      flexGrow: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold">
                      SSG President
                    </Typography>
                    <Typography variant="h6" mt={1}>
                      [Name Here]
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={8}
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box flexGrow={1} p={4}>
                  <List>
                    {[
                      { role: "Vice President", name: "[Name]" },
                      { role: "Secretary", name: "[Name]" },
                      { role: "Treasurer", name: "[Name]" },
                      { role: "Auditor", name: "[Name]" },
                      { role: "Public Information Officer", name: "[Name]" },
                      { role: "Peace Officer", name: "[Name]" },
                    ].map((officer) => (
                      <ListItem key={officer.role} divider>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="#1e40af"
                            >
                              {officer.role}
                            </Typography>
                          }
                          secondary={officer.name}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box textAlign="center" p={3}>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/vote"
                    size="large"
                    sx={{
                      bgcolor: "#1e40af",
                      px: 6,
                      py: 1.8,
                      borderRadius: 8,
                    }}
                  >
                    Vote for Upcoming Elections
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Clubs Section */}
        <Box mt={{ xs: 10, md: 16 }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            color="#1e40af"
            gutterBottom
          >
            Join Our Vibrant Clubs!
          </Typography>

          <Grid container spacing={4} mt={4}>
            {[
              {
                name: "Sports Club",
                desc: "Develop strength, teamwork, and sportsmanship through basketball, volleyball, and athletics.",
                img: "https://www.rappler.com/tachyon/2023/05/UAAP-HSGVB-FIONNA-INOCENTES-3829.jpg",
              },
              {
                name: "Torch Club",
                desc: "Cultivate leadership and community service with meaningful projects and initiatives.",
                img: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1177777421039055",
              },
              {
                name: "Tanglaw Club",
                desc: "Nurture spiritual growth and values formation through guidance activities.",
                img: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1177777387705725",
              },
              {
                name: "Art Club",
                desc: "Unleash creativity through drawing, painting, crafts, and artistic expression.",
                img: "https://images.pexels.com/photos/159581/art-painting-brush-paint-159581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
              },
              {
                name: "Dance Troupe",
                desc: "Master folk, modern, and contemporary dance for performances and cultural events.",
                img: "https://www.upv.edu.ph/images/tunog-tikang3-2019.jpg",
              },
              {
                name: "Drum & Lyre Corps",
                desc: "Excel in marching band, drum corps, and musical performances.",
                img: "https://i.ytimg.com/vi/6rLgX12Vvng/maxresdefault.jpg",
              },
            ].map((club) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={club.name}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: 6,
                      transition: "box-shadow 0.3s",
                      "&:hover": { boxShadow: 16 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={club.img}
                      alt={club.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="#1e40af"
                        gutterBottom
                      >
                        {club.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {club.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={8}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register-club"
                sx={{
                  bgcolor: "#1e40af",
                  px: 8,
                  py: 2.5,
                  fontSize: "1.2rem",
                  borderRadius: 8,
                }}
              >
                Register for a Club Today!
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
