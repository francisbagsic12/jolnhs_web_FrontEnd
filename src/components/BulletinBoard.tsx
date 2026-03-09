// src/components/BulletinBoard.tsx
import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { motion } from "framer-motion";

const BulletinBoard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const principal = {
    name: "Racquel C. Diaz",
    position: "Principal",
    image: "/images/principal-racquel.jpg",
    desc: "Leading with vision, dedication, and unwavering commitment to quality education and student excellence.",
  };

  const assistants = [
    {
      name: "Melanie J. Yambot",
      position: "Assistant Principal",
      image: "/images/asst-melanie.jpg",
      desc: "Supporting academic programs, student welfare, and overall school operations with strong leadership.",
    },
    {
      name: "Genesio Ruiz",
      position: "Assistant Principal",
      image: "/images/asst-genesio.jpg",
      desc: "Focusing on discipline, co-curricular activities, and creating a safe, inclusive learning environment.",
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: "linear-gradient(to bottom, #f8fafc, #e2e8f0)",
        borderTop: "10px solid #1e40af",
        borderBottom: "1px solid rgba(30, 58, 138, 0.15)",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={{ xs: 8, md: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#1e40af",
                mx: "auto",
                mb: 3,
                boxShadow: "0 10px 30px rgba(30,58,138,0.35)",
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: "white" }} />
            </Avatar>

            <Typography
              variant="h3"
              component="h2"
              fontWeight={800}
              gutterBottom
              sx={{
                background: "linear-gradient(90deg, #1e40af, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              School Leadership
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              fontWeight={500}
              mb={2}
              sx={{ fontStyle: "italic" }}
            >
              Julia Ortiz Luis National High School
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              maxWidth={720}
              mx="auto"
              sx={{ lineHeight: 1.8 }}
            >
              Guided by dedicated administrators who inspire excellence, foster
              inclusivity, and nurture every student's potential.
            </Typography>
          </motion.div>
        </Box>

        <Divider
          sx={{
            width: "100px",
            mx: "auto",
            mb: 8,
            borderWidth: 4,
            borderColor: "#1e40af",
            borderRadius: 2,
          }}
        />

        {/* Leadership Grid - Principal centered & larger */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {/* Left Assistant */}
          {!isMobile && (
            <Grid size={{ md: 4 }}>
              <AssistantCard admin={assistants[0]} index={0} />
            </Grid>
          )}

          {/* Center: Principal */}
          <Grid size={{ xs: 12, md: 4 }}>
            <PrincipalCard principal={principal} />
          </Grid>

          {/* Right Assistant */}
          {!isMobile && (
            <Grid size={{ md: 4 }}>
              <AssistantCard admin={assistants[1]} index={1} />
            </Grid>
          )}

          {/* Mobile: Assistants stacked below */}
          {isMobile && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AssistantCard admin={assistants[0]} index={0} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AssistantCard admin={assistants[1]} index={1} />
              </Grid>
            </>
          )}
        </Grid>

        {/* New: Faculty & Staff Group Photo Section (bottom) */}
        <Box mt={{ xs: 12, md: 16 }}>
          <Divider
            sx={{
              width: "120px",
              mx: "auto",
              mb: 6,
              borderWidth: 3,
              borderColor: "#1e40af",
              borderRadius: 2,
            }}
          />

          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            gutterBottom
            sx={{
              color: "#1e40af",
              mb: 4,
            }}
          >
            Our Dedicated Faculty & Staff
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            maxWidth={800}
            mx="auto"
            mb={6}
            sx={{ lineHeight: 1.8 }}
          >
            The heart of JOLNHS – our committed teachers and staff who inspire,
            guide, and empower every JOLIAN to reach their full potential.
          </Typography>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 15px 50px rgba(30,58,138,0.25)",
                border: "4px solid #1e40af",
              }}
            >
              <CardMedia
                component="img"
                image="data:image/webp;base64,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" // ← Ilagay ang actual group photo dito sa public/images/
                alt="JOLNHS Faculty and Staff Group Photo"
                sx={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  transition: "transform 0.6s ease",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              />
              {/* Subtle overlay text para sa caption feel */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: "rgba(30, 58, 138, 0.6)",
                  color: "white",
                  py: 2,
                  px: 4,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  United in Excellence • JOLNHS Faculty & Staff
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Footer note */}
        <Box textAlign="center" mt={12}>
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ fontStyle: "italic" }}
          >
            Leadership & Faculty Team • School Year 2025–2026 • Committed to
            Excellence & Student Success
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// PrincipalCard at AssistantCard (pinanatili nang walang pagbabago para maikli ang sagot)
const PrincipalCard: React.FC<{ principal: any }> = ({ principal }) => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, type: "spring", stiffness: 80 }}
    >
      <Card
        elevation={6}
        sx={{
          height: "100%",
          borderRadius: 6,
          overflow: "hidden",
          bgcolor: "white",
          border: "2px solid #1e40af",
          boxShadow: "0 12px 40px rgba(30,58,138,0.25)",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": {
            transform: "translateY(-20px) scale(1.03)",
            boxShadow: "0 30px 90px rgba(30,58,138,0.35)",
          },
        }}
      >
        <Box sx={{ position: "relative", pt: "100%" }}>
          <CardMedia
            component="img"
            image={
              principal.image ||
              `https://via.placeholder.com/600x600/1e40af/ffffff?text=${encodeURIComponent(principal.name.split(" ")[0])}`
            }
            alt={`${principal.name} - ${principal.position}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderBottom: "8px solid #1e40af",
              transition: "transform 0.7s ease",
              "&:hover": { transform: "scale(1.1)" },
            }}
          />
          <Avatar
            sx={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 100,
              border: "8px solid white",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              bgcolor: "#1e40af",
            }}
          >
            <SchoolIcon sx={{ fontSize: 50, color: "white" }} />
          </Avatar>
        </Box>

        <CardContent
          sx={{ pt: 9, pb: 6, px: { xs: 3, md: 5 }, textAlign: "center" }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            color="#1e40af"
            gutterBottom
          >
            {principal.name}
          </Typography>
          <Typography
            variant="h6"
            color="text.primary"
            fontWeight={700}
            sx={{ mb: 3 }}
          >
            {principal.position}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            {principal.desc}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AssistantCard: React.FC<{ admin: any; index: number }> = ({
  admin,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
    >
      <Card
        elevation={3}
        sx={{
          height: "100%",
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "white",
          border: "1px solid rgba(30,58,138,0.15)",
          transition: "all 0.4s ease",
          "&:hover": {
            transform: "translateY(-16px)",
            boxShadow: "0 24px 70px rgba(30,58,138,0.25)",
            borderColor: "#3b82f6",
          },
        }}
      >
        <Box sx={{ position: "relative", pt: "100%" }}>
          <CardMedia
            component="img"
            image={
              admin.image ||
              `https://via.placeholder.com/500x500/3b82f6/ffffff?text=${encodeURIComponent(admin.name.split(" ")[0])}`
            }
            alt={`${admin.name} - ${admin.position}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderBottom: "6px solid #3b82f6",
              transition: "transform 0.6s ease",
              "&:hover": { transform: "scale(1.08)" },
            }}
          />
          <Avatar
            sx={{
              position: "absolute",
              bottom: -28,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 80,
              border: "6px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              bgcolor: "#3b82f6",
            }}
          >
            <PersonIcon sx={{ fontSize: 40, color: "white" }} />
          </Avatar>
        </Box>

        <CardContent sx={{ pt: 7, pb: 5, px: 4, textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#1e40af"
            gutterBottom
          >
            {admin.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.primary"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {admin.position}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            {admin.desc}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BulletinBoard;
