import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // For Vision
import VisibilityIcon from "@mui/icons-material/Visibility";
import TaskAltIcon from "@mui/icons-material/TaskAlt"; // For Mission
import FavoriteIcon from "@mui/icons-material/Favorite"; // For Core Values

const About: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Offset para sa fixed navbar
  const navbarHeight = isMobile ? 64 : 80;
  const extraDesktopMargin = isMobile ? 0 : 24;
  const topOffset = navbarHeight + extraDesktopMargin;

  return (
    <Box sx={{ pt: `${topOffset}px`, bgcolor: "#f8f9ff", minHeight: "100vh" }}>
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "65vh", md: "85vh" },
          backgroundImage: "url('public/bg.jfif')", // Modern Philippine school building
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(30, 58, 138, 0.75)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box textAlign="center" color="white">
            <SchoolIcon sx={{ fontSize: { xs: 70, md: 120 }, mb: 3 }} />
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "3rem", sm: "4.5rem", md: "6rem" },
                textShadow: "4px 4px 12px rgba(0,0,0,0.7)",
                letterSpacing: "0.5px",
              }}
            >
              About Our School
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: "lg",
                mx: "auto",
                fontStyle: "italic",
                fontSize: { xs: "1.3rem", md: "1.8rem" },
                opacity: 0.95,
              }}
            >
              Julia Ortiz Luis National High School – Empowering Learners,
              Building Futures with Excellence and Integrity
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Introduction Section - More Engaging */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={12} sx={{ borderRadius: 5, overflow: "hidden" }}>
              <CardMedia
                component="img"
                image="public/bg.jfif"
                alt="Students during flag ceremony"
                sx={{ height: { xs: 300, md: 450 } }}
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h3"
              gutterBottom
              color="#1e3a8a"
              fontWeight="bold"
              sx={{ mb: 4 }}
            >
              Welcome to Julia Ortiz Luis National High School
            </Typography>
            <Divider
              sx={{ bgcolor: "#1e3a8a", height: 4, width: 100, mb: 4 }}
            />
            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "1.15rem",
                lineHeight: 2,
                textAlign: "justify",
                color: "text.primary",
              }}
            >
              Julia Ortiz Luis National High School is a public secondary
              institution committed to delivering quality and inclusive
              education. We provide a safe, supportive, and nurturing learning
              environment through our dedicated teachers, strong parent
              partnerships, and modern facilities — all aimed at developing
              academically competent, morally upright, and values-driven
              learners ready for the future.
            </Typography>
          </Grid>
        </Grid>

        {/* Vision, Mission, Core Values - Enhanced Cards with Icons */}
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          color="#1e3a8a"
          fontWeight="bold"
          sx={{ mb: 8 }}
        >
          Our Guiding Principles
        </Typography>
        <Grid container spacing={6}>
          {/* Vision */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={12}
              sx={{
                height: "100%",
                borderRadius: 5,
                transition: "all 0.4s ease",
                "&:hover": {
                  transform: "translateY(-15px)",
                  boxShadow: "0 20px 40px rgba(30,58,138,0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image="https://www.brookings.edu/wp-content/uploads/2019/08/CUE_Phillippines_classroom001.jpg"
                alt="Vision - Future Leaders"
              />
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <VisibilityIcon
                  sx={{ fontSize: 50, color: "#1e3a8a", mb: 2 }}
                />
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="bold"
                  color="#1e3a8a"
                >
                  Vision
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  A center of excellence in secondary education producing
                  globally competitive, morally upright, and productive
                  citizens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Mission */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={12}
              sx={{
                height: "100%",
                borderRadius: 5,
                transition: "all 0.4s ease",
                "&:hover": {
                  transform: "translateY(-15px)",
                  boxShadow: "0 20px 40px rgba(30,58,138,0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image="https://ddc514qh7t05d.cloudfront.net/dA/306c595ccd13fc6a6dbe70ea529c7c14/2400w/80q"
                alt="Mission - Quality Education"
              />
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <TaskAltIcon sx={{ fontSize: 50, color: "#1e3a8a", mb: 2 }} />
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="bold"
                  color="#1e3a8a"
                >
                  Mission
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  To provide relevant and quality secondary education that
                  develops learners' full potential through competent teachers,
                  strong stakeholder partnerships, and a conducive learning
                  environment.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Core Values */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={12}
              sx={{
                height: "100%",
                borderRadius: 5,
                transition: "all 0.4s ease",
                "&:hover": {
                  transform: "translateY(-15px)",
                  boxShadow: "0 20px 40px rgba(30,58,138,0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image="https://images.subsplash.com/image.jpg?id=a428fc21-831f-4782-b275-552524c0c932&w=800&h=450"
                alt="Core Values - Unity and Service"
              />
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <FavoriteIcon sx={{ fontSize: 50, color: "#1e3a8a", mb: 2 }} />
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="bold"
                  color="#1e3a8a"
                >
                  Core Values
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  <Chip label="Excellence" color="primary" />
                  <Chip label="Integrity" color="primary" />
                  <Chip label="Respect" color="primary" />
                  <Chip label="Responsibility" color="primary" />
                  <Chip label="Service" color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
