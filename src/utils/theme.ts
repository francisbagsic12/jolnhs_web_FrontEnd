import { createTheme } from "@mui/material/styles";

// Create a modern blue-white theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1e3a8a", // Deep blue for buttons, accents
      light: "#3b82f6", // Lighter blue for hovers
      dark: "#162e73", // Darker for active states
    },
    secondary: {
      main: "#dc2626", // Optional red accent (e.g., for announcements)
    },
    background: {
      default: "#ffffff", // Clean white background
      paper: "#f8f9ff", // Light blue-white for cards/papers
    },
    text: {
      primary: "#1e3a8a", // Blue text for readability
      secondary: "#4b5563", // Gray for subtitles
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Modern sans-serif font
    h1: { fontWeight: 700, letterSpacing: "-0.02em" }, // Bold and spaced
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.6 }, // Readable body text
  },
  components: {
    // Modern overrides: Rounded corners, shadows, transitions
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill-shaped buttons for modern look
          textTransform: "none", // No uppercase
          padding: "12px 24px",
          boxShadow: "0 4px 10px rgba(30,58,138,0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 15px rgba(30,58,138,0.2)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Rounded cards
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)", // Subtle modern shadow
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        },
      },
    },
  },
  spacing: 8, // Increased base spacing for modern airy feel
});

export default theme;
