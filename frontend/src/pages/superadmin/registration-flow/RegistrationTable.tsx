import React, { useState } from "react";
import {
  Box, Typography, TextField, MenuItem, Paper, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Skeleton, Chip, Button, Card
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InboxIcon from "@mui/icons-material/Inbox";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const getOwnerName = (row: any) => {
  return row?.ownerName || row?.owner || row?.contactName || row?.contactPerson || "—";
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "Pending": return "In-Progress";
    case "ChangesRequested": return "Changes Requested";
    case "Approved": return "Approved";
    case "Rejected": return "Rejected";
    default: return status || "In-Progress";
  }
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

interface RegistrationTableProps {
  businesses: any[];
  loading: boolean;
  onOpenPipeline: (biz: any) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({ businesses, loading, onOpenPipeline }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const categories = Array.from(
    new Set(businesses.map((b: any) => b.category).filter(Boolean))
  ) as string[];

  const searchedBusinesses = businesses.filter((b: any) => {
    const matchesSearch =
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOwnerName(b).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? b.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const paginatedRows = searchedBusinesses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header & Filters on one line */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Registration
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ minWidth: 280, bgcolor: "#fff" }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="Business Type"
            size="small"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 220, bgcolor: "#fff" }}
          >
            <MenuItem value="">All Types</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "SHOP NAME",
                  "SHOP TYPE",
                  "OWNER NAME",
                  "PHONE",
                  "EMAIL",
                  "ON BOARDING STATUS",
                  "SUBMITTED ON",
                ].map((h) => (
                  <TableCell key={h}>
                    {h}
                  </TableCell>
                ))}
                <TableCell align="center">
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && businesses.length === 0 ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}><Skeleton height={28} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                      <InboxIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body2">No registrations found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row: any) => (
                  <TableRow
                    key={row._id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}>
                      {row.name || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {row.category || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {getOwnerName(row)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {row.phone || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, maxWidth: 220 }}>
                      <Typography variant="body2" sx={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.email || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}
                        label={getStatusLabel(row.verificationStatus)}
                        size="small"
                        color={row.verificationStatus === "ChangesRequested" ? "warning" : "primary"}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          height: 26,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
                        {formatDate(row.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => onOpenPipeline(row)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: 12,
                          px: 2.5,
                          boxShadow: "none",
                          "&:hover": { boxShadow: "none" },
                        }}
                      >
                        Onboarding
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={searchedBusinesses.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[8, 15, 25, 50]}
          sx={{
            ".MuiTablePagination-toolbar": { minHeight: 52 },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: 13,
              color: "text.secondary",
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default RegistrationTable;
