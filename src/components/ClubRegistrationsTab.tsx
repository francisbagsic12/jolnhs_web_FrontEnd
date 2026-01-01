// src/admin/components/ClubRegistrationsTab.tsx
import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

interface Registration {
  id: string;
  name: string;
  club: string;
  time: string;
}

interface ClubRegistrationsTabProps {
  recentRegistrations?: Registration[];
}

export const ClubRegistrationsTab: React.FC<ClubRegistrationsTabProps> = ({
  recentRegistrations = [],
}) => {
  return (
    <Paper elevation={8} sx={{ borderRadius: 4, p: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="#1e3a8a" gutterBottom>
        Recent Club Registrations
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Student Name</strong>
              </TableCell>
              <TableCell>
                <strong>Club</strong>
              </TableCell>
              <TableCell>
                <strong>Time</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentRegistrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>{reg.id}</TableCell>
                <TableCell>{reg.name}</TableCell>
                <TableCell>
                  <Chip label={reg.club} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={reg.time} size="small" color="primary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
