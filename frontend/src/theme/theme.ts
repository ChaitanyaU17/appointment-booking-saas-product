import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#659287',
      light: '#88BDA4',
      dark: '#4a6b62',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#88BDA4',
      contrastText: '#ffffff',
    },
    success: {
      main: '#5c9a6e',
      light: '#B1D3B9',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569', 
    },
    divider: 'rgba(15, 23, 42, 0.08)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            '&:hover': { boxShadow: '0 6px 16px rgba(101,146,135,0.35)' },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          borderRadius: 16,
          border: '1px solid rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#659287',
          '& .MuiTableCell-head': {
            color: '#ffffff',
            fontWeight: 700,
            borderRight: '1px solid rgba(255,255,255,0.15)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          '&:last-child': {
            borderRight: 'none',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#659287',
            color: '#ffffff',
            borderRadius: 0,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'rgba(255,255,255,0.15)',
          },
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
          },
          '& .MuiDataGrid-iconSeparator': {
            color: 'rgba(255,255,255,0.15)',
          }
        },
      },
    },
  },
});

export default theme;