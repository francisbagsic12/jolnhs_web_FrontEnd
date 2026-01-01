// src/admin/components/Sidebar.tsx
import React from "react";
import {
  Box,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  AppBar,
  IconButton,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// Icons
import BarChartIcon from "@mui/icons-material/BarChart";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CampaignIcon from "@mui/icons-material/Campaign";
import SettingsIcon from "@mui/icons-material/Settings"; // Election Control
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // ← NEW: Election Results
import LogoutIcon from "@mui/icons-material/Logout";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
interface SidebarProps {
  tabValue: number;
  setTabValue: (value: number) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
  isMobile: boolean;
}

// Updated menu items — may Election Control at Election Results na!
const menuItems = [
  { label: "Overview", icon: <BarChartIcon />, value: 0 },
  { label: "Voting Monitor", icon: <HowToVoteIcon />, value: 1 },
  { label: "Club Registrations", icon: <GroupAddIcon />, value: 2 },
  { label: "Announcements", icon: <CampaignIcon />, value: 3 },
  { label: "Election Control", icon: <SettingsIcon />, value: 4 },
  { label: "Election Winner History", icon: <EmojiEventsIcon />, value: 5 },
  { label: "vote history", icon: <ManageHistoryIcon />, value: 6 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  tabValue,
  setTabValue,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
  isMobile,
}) => {
  const drawerContent = (
    <Box
      sx={{
        width: 280,
        bgcolor: "#1e3a8a",
        height: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Toolbar sx={{ bgcolor: "#162e73", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          JOLNHS Admin
        </Typography>
      </Toolbar>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={tabValue === item.value}
              onClick={() => {
                setTabValue(item.value);
                if (isMobile) setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                },
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
              }}
            >
              <Box sx={{ mr: 2, display: "flex", color: "white" }}>
                {item.icon}
              </Box>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: tabValue === item.value ? "bold" : "medium",
                  variant: "body1",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.3)", mx: 2 }} />

      {/* Logout */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // Mobile View
  if (isMobile) {
    return (
      <>
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "#1e3a8a",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
              JOLNHS Admin
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  // Desktop View - Fixed Sidebar
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1200,
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {drawerContent}
    </Box>
  );
};
