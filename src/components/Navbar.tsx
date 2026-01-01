import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // ← Added for admin/security feel
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "About", path: "/about" },
    { text: "Vote", path: "/vote" },
    { text: "Join a Club", path: "/register-club" },
  ];

  const adminItem = { text: "Admin Login", path: "/admin-login" };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            selected={location.pathname === item.path}
          >
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
      {/* Highlighted Admin Login sa mobile drawer */}
      <ListItem
        disablePadding
        sx={{ mt: 1, borderTop: "1px solid rgba(255,255,255,0.15)" }}
      >
        <ListItemButton
          component={Link}
          to={adminItem.path}
          onClick={handleDrawerToggle}
          selected={location.pathname === adminItem.path}
          sx={{
            bgcolor:
              location.pathname === adminItem.path
                ? "rgba(255,255,255,0.15)"
                : "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          <LockOutlinedIcon sx={{ mr: 2, color: "white" }} fontSize="small" />
          <ListItemText primary={adminItem.text} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={isMobile ? 4 : 0}
        sx={{
          bgcolor: isMobile ? "primary.main" : "transparent",
          backdropFilter: isMobile ? "none" : "blur(20px)",
          transition: "all 0.3s ease",
          position: "fixed",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 80 } as any,
            bgcolor: isMobile ? "primary.main" : "rgba(37, 4, 156, 0.85)",
            borderRadius: isMobile ? 0 : 6,
            mx: isMobile ? 0 : { md: 4, lg: 8 },
            my: isMobile ? 0 : 3,
            boxShadow: isMobile
              ? "none"
              : "0 10px 30px rgba(30, 58, 138, 0.15)",
            border: isMobile ? "none" : "1px solid rgba(30, 58, 138, 0.1)",
          }}
        >
          <SchoolIcon
            sx={{
              mr: 2,
              fontSize: { xs: 32, md: 40 },
              color: isMobile ? "white" : "white",
            }}
          />
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: isMobile ? "white" : "white",
            }}
          >
            Julia Ortiz Luis National High School
          </Typography>

          {isMobile ? (
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="primary"
                  component={Link}
                  to={item.path}
                  variant={
                    location.pathname === item.path ? "contained" : "text"
                  }
                  sx={{
                    px: 3, // Slightly smaller padding
                    py: 1.2,
                    borderRadius: 50,
                    fontWeight: "medium",
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow:
                      location.pathname === item.path
                        ? "0 6px 20px rgba(30,58,138,0.3)"
                        : "none",
                    "&:hover": {
                      bgcolor:
                        location.pathname === item.path
                          ? "primary.dark"
                          : "rgba(255,255,255,0.12)",
                      transform: "translateY(-2px) scale(1.05)",
                      boxShadow: "0 8px 25px rgba(30,58,138,0.25)",
                    },
                    transition: "all 0.25s ease",
                    color: "white",
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {/* Modernized Admin Login Button */}
              {/* <Button
                component={Link}
                to={adminItem.path}
                variant="outlined"
                startIcon={<LockOutlinedIcon />}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 50,
                  fontWeight: "medium",
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.7)",
                  borderWidth: 1.5,
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderColor: "white",
                    transform: "translateY(-2px) scale(1.05)",
                    boxShadow: "0 8px 25px rgba(255,255,255,0.2)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Admin
              </Button> */}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
