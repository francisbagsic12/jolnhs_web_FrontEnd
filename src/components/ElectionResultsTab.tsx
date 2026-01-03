// src/admin/components/ElectionResultsTab.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  CircularProgress,
  Tooltip,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import {
  EmojiEvents,
  Celebration,
  Refresh,
  HowToVote,
  People,
  WarningAmber,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:5000/api";
interface ElectionPeriod {
  id: string;
  label: string;
  date: string;
  startDate?: string;
}
interface Winner {
  position: string;
  positionLabel: string;
  winnerName: string;
  winnerTeam: string;
  candidateId: string;
  votes: number;
  percentage: string;
  isTie: boolean;
}

interface ResultsData {
  winners: Winner[];
  totalVotes: number;
  electionTitle?: string;
  completedAt?: string;
}

const positionOrder = [
  "president",
  "vicePresident",
  "secretary",
  "treasurer",
  "auditor",
  "pio",
  "peaceOfficer",
];

const getMedalColor = (index: number): string => {
  switch (index) {
    case 0:
      return "#FFD700"; // Gold
    case 1:
      return "#C0C0C0"; // Silver
    case 2:
      return "#CD7F32"; // Bronze
    default:
      return "#757575";
  }
};

export const ElectionResultsTab: React.FC = () => {
  const [periods, setPeriods] = useState<ElectionPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | string>(
    "current"
  );
  const [results, setResults] = useState<ResultsData>({
    winners: [],
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [_periodLoading, setPeriodLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [exportingWord, setExportingWord] = useState<boolean>(false);

  const fetchPeriods = async () => {
    try {
      setPeriodLoading(true);
      const res = await fetch(`${API_BASE}/admin/election-periods`);
      if (!res.ok) throw new Error("Failed to fetch periods");
      const data = await res.json();
      setPeriods(data.periods || []);
    } catch (err) {
      console.error(err);
      setPeriods([]);
    } finally {
      setPeriodLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_BASE}/admin/winners`;
      if (selectedPeriod !== "current") {
        url = `${API_BASE}/admin/winners/${selectedPeriod}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            selectedPeriod === "current"
              ? " voting is ongoing."
              : "No results have been recorded for this election."
          );
        }
        throw new Error("Hindi ma-load ang resulta");
      }

      const data = await res.json();

      setResults({
        winners: data.winners || [],
        totalVotes: data.totalVotes || 0,
        electionTitle: data.electionTitle,
        completedAt: data.completedAt
          ? new Date(data.completedAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
      });
    } catch (err: any) {
      setError(err.message || "May error sa pag-load ng resulta");
      setResults({ winners: [], totalVotes: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedPeriod]);

  const { winners, totalVotes, electionTitle, completedAt } = results;

  const isCurrent = selectedPeriod === "current";
  const headerTitle = isCurrent
    ? "History / Latest Election Results"
    : electionTitle ||
      periods.find((p) => p.id === selectedPeriod)?.label ||
      "Selected Election";

  // === EXPORT TO WORD FUNCTION ===
  const exportToWord = async () => {
    if (winners.length === 0) {
      alert("Walang data na ma-e-export.");
      return;
    }

    setExportingWord(true);

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `JOLNHS SSG Election Results`,
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: electionTitle || headerTitle,
                    bold: true,
                    size: 28,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: completedAt
                      ? `Results as of ${completedAt}`
                      : "Official Results",
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              // Table Header
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: "Position" })],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Winner Name" })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Team" })],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Votes" })],
                        width: { size: 15, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Percentage" })],
                        width: { size: 10, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),

                  // Table Rows
                  ...winners.map(
                    (w) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph(w.positionLabel)],
                          }),
                          new TableCell({
                            children: [new Paragraph(w.winnerName)],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(w.winnerTeam || "Independent"),
                            ],
                          }),
                          new TableCell({
                            children: [new Paragraph(w.votes.toString())],
                          }),
                          new TableCell({
                            children: [new Paragraph(`${w.percentage}%`)],
                          }),
                        ],
                      })
                  ),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Total Votes Cast: ${totalVotes.toLocaleString()}`,
                    bold: true,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        `Election_Results_${electionTitle || "Latest"}_${
          new Date().toISOString().split("T")[0]
        }.docx`
      );
    } catch (err) {
      console.error("Error generating Word document:", err);
      alert("May error sa paglikha ng Word file. Subukang muli.");
    } finally {
      setExportingWord(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Header Banner */}
      <Paper
        elevation={10}
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 5,
          bgcolor: "#1a237e",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -60, right: -60, opacity: 0.12 }}>
          <EmojiEvents sx={{ fontSize: 360 }} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
            <EmojiEvents sx={{ fontSize: 60 }} />
            <Box>
              <Typography variant="h3" fontWeight="bold">
                {headerTitle}
              </Typography>
              {completedAt && (
                <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                  Results as of {completedAt}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ bgcolor: "rgba(255,255,255,0.25)", my: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<HowToVote />}
                label={`${totalVotes.toLocaleString()} Total Votes Cast`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: "bold",
                  py: 2.5,
                }}
              />
              <Chip
                icon={<People />}
                label={`${winners.length} Positions Declared`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: "bold",
                  py: 2.5,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ minWidth: 280 }}>
                <InputLabel sx={{ color: "white" }}>
                  Select Election Period
                </InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Select Election Period"
                  onChange={(e) => setSelectedPeriod(e.target.value as string)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                  }}
                >
                  <MenuItem value="current">Current / Latest Election</MenuItem>
                  {periods.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.label} — Started: {p.date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Refresh Results">
                <IconButton
                  onClick={fetchResults}
                  disabled={loading}
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              {/* EXPORT TO WORD BUTTON */}
              <Button
                variant="contained"
                color="success"
                startIcon={
                  exportingWord ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={exportToWord}
                disabled={exportingWord || winners.length === 0}
                sx={{ fontWeight: "bold" }}
              >
                {exportingWord ? "Exporting..." : "Export to Word"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="warning" sx={{ mb: 4, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <CircularProgress size={80} thickness={5} />
          <Typography variant="h6" sx={{ mt: 4 }}>
            Loading official election results...
          </Typography>
        </Box>
      ) : winners.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#f8f9fa",
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {isCurrent ? "Botohan pa ongoing" : "Walang naitalang resulta"}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 600, mx: "auto" }}
          >
            {isCurrent
              ? "result will show after voting ended"
              : "no data or empty eleceted officer for this elecetion period."}
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {positionOrder.map((posKey, index) => {
              const winner = winners.find((w) => w.position === posKey);
              if (!winner) return null;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={posKey}>
                  <Card
                    elevation={8}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 12,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: getMedalColor(index),
                        color: "white",
                        p: 4,
                        textAlign: "center",
                        position: "relative",
                      }}
                    >
                      <Celebration
                        sx={{
                          fontSize: 60,
                          opacity: 0.2,
                          position: "absolute",
                          top: 10,
                          right: 10,
                        }}
                      />
                      <Typography variant="h5" fontWeight="bold">
                        {winner.positionLabel}
                      </Typography>
                    </Box>

                    <CardContent sx={{ pt: 4, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#1a237e"
                        gutterBottom
                      >
                        {winner.winnerName}
                      </Typography>

                      <Chip
                        label={winner.winnerTeam || "Independent"}
                        size="medium"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 3, fontWeight: "medium" }}
                      />

                      {winner.isTie && (
                        <Chip
                          icon={<WarningAmber />}
                          label="TIE RESULT"
                          color="warning"
                          size="small"
                          sx={{ mb: 2 }}
                        />
                      )}

                      <Box sx={{ my: 3 }}>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {winner.votes.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          votes out of {totalVotes.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ px: 4, mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(winner.percentage)}
                          sx={{
                            height: 16,
                            borderRadius: 8,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: getMedalColor(index),
                            },
                          }}
                        />
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{ mt: 1.5, color: getMedalColor(index) }}
                        >
                          {winner.percentage}%
                        </Typography>
                      </Box>

                      <Chip
                        icon={<EmojiEvents />}
                        label="OFFICIAL WINNER"
                        sx={{
                          mt: 3,
                          fontSize: "1.1rem",
                          py: 2,
                          fontWeight: "bold",
                          bgcolor: "#FFD700",
                          color: "#1a237e",
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 10, py: 6 }}>
            <Celebration sx={{ fontSize: 90, color: "#FFD700", mb: 2 }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#1a237e"
              gutterBottom
            >
              Congratulations to All Winners!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              congratulation to all new officers!
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ElectionResultsTab;
