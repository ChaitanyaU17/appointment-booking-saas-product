import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minWidth?: number | string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', minWidth = 250 }: SearchBarProps) {
  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          sx: { 
            borderRadius: '50px', 
            bgcolor: 'background.paper',
            '& fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.12)',
            },
          }
        }
      }}
      sx={{ minWidth }}
    />
  );
}
