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
    </List>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={isMobile ? 4 : 0} // No shadow on desktop for floating feel
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
            <Box sx={{ display: "flex", gap: 2 }}>
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
                    px: 4,
                    py: 1.5,
                    borderRadius: 50,
                    fontWeight: "medium",
                    textTransform: "none",
                    fontSize: "1.1rem",
                    boxShadow:
                      location.pathname === item.path
                        ? "0 6px 20px rgba(30,58,138,0.3)"
                        : "none",
                    "&:hover": {
                      bgcolor:
                        location.pathname === item.path
                          ? "primary.dark"
                          : "rgba(9, 10, 10, 0.08)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(30,58,138,0.2)",
                    },
                    transition: "all 0.3s ease",
                    color: "white",
                  }}
                >
                  {item.text}
                </Button>
              ))}
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
