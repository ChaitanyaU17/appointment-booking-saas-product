import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Box, Typography, TextField, MenuItem, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Skeleton, Chip, Button, Card, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InboxIcon from "@mui/icons-material/Inbox";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const getOwnerName = (row: any) => {
  const direct = (
    row?.ownerName ||
    row?.owner ||
    row?.contactName ||
    row?.contactPerson ||
    row?.adminName ||
    row?.admin?.name ||
    ''
  ).trim();
  if (direct) return direct;
  return "—";
};

const getShopName = (row: any) => {
  const name = (row?.name || '').trim();
  const owner = getOwnerName(row);
  if (!name || name === row?.ownerName || (owner !== "—" && name.toLowerCase() === owner.toLowerCase())) {
    return "-";
  }
  return name;
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

interface RegistrationTableRowProps {
  row: any;
  onOpenPipeline: (biz: any) => void;
  onRequestDelete?: (biz: any) => void;
}

const RegistrationTableRow = memo(({ row, onOpenPipeline, onRequestDelete }: RegistrationTableRowProps) => {
  return (
    <TableRow
      hover
      sx={{ "&:last-child td": { borderBottom: 0 } }}
    >
      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}>
        {getShopName(row)}
      </TableCell>
      <TableCell sx={{ fontSize: 13 }}>
        {row.category || "—"}
      </TableCell>
      <TableCell sx={{ fontSize: 13 }}>
        {getOwnerName(row)}
      </TableCell>
      <TableCell sx={{ fontSize: 13 }}>
        {(row.phone && row.phone !== 'N/A') ? row.phone : (row.ownerPhone || "—")}
      </TableCell>
      <TableCell sx={{ fontSize: 13, maxWidth: 220 }}>
        <Typography variant="body2" sx={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.email || row.ownerEmail || "-"}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
              px: 2,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            Onboarding
          </Button>
          {onRequestDelete && (
            <Tooltip title="Delete Registration">
              <IconButton
                size="small"
                onClick={() => onRequestDelete(row)}
                sx={{
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 1.5,
                  p: 0.6,
                  '&:hover': { bgcolor: '#fef2f2', borderColor: '#dc2626' }
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
});
RegistrationTableRow.displayName = "RegistrationTableRow";

interface RegistrationTableProps {
  businesses: any[];
  loading: boolean;
  onOpenPipeline: (biz: any) => void;
  onOpenRegisterModal: () => void;
  onDeleteShop?: (biz: any) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({ businesses, loading, onOpenPipeline, onOpenRegisterModal, onDeleteShop }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bizToDelete, setBizToDelete] = useState<any>(null);

  const handleRequestDelete = useCallback((biz: any) => {
    setBizToDelete(biz);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (bizToDelete && onDeleteShop) {
      onDeleteShop(bizToDelete);
      setDeleteConfirmOpen(false);
      setBizToDelete(null);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const categories = useMemo(() => {
    return Array.from(
      new Set(businesses.map((b: any) => b.category).filter(Boolean))
    ) as string[];
  }, [businesses]);

  const searchedBusinesses = useMemo(() => {
    return businesses.filter((b: any) => {
      const owner = getOwnerName(b).toLowerCase();
      const shop = getShopName(b).toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (shop !== "-" && shop.includes(term)) ||
        (owner !== "—" && owner.includes(term)) ||
        b.email?.toLowerCase().includes(term) ||
        b.phone?.toLowerCase().includes(term);
      const matchesCategory = categoryFilter ? b.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [businesses, searchTerm, categoryFilter]);

  const paginatedRows = useMemo(() => {
    return searchedBusinesses.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [searchedBusinesses, page, rowsPerPage]);

  return (
    <Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Registration
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ minWidth: 240, bgcolor: "#fff" }}
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
            sx={{ minWidth: 180, bgcolor: "#fff" }}
          >
            <MenuItem value="">All Types</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={onOpenRegisterModal}
            sx={{
              bgcolor: '#659287',
              '&:hover': { bgcolor: '#4a6b62' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 0.9,
              boxShadow: '0 2px 8px rgba(101, 146, 135, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            Register Shop Owner
          </Button>
        </Box>
      </Box>

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
                    <TableCell colSpan={9}><Skeleton height={28} /></TableCell>
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
                  <RegistrationTableRow
                    key={row._id}
                    row={row}
                    onOpenPipeline={onOpenPipeline}
                    onRequestDelete={onDeleteShop ? handleRequestDelete : undefined}
                  />
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Delete Registration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            Are you sure you want to delete registration for <strong>{bizToDelete?.name || getOwnerName(bizToDelete) || 'this shop'}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: "#dc2626", mt: 1, fontSize: 12.5, fontWeight: 600 }}>
            This will remove the shop registration and any associated credentials.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(RegistrationTable);
