import { memo } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { fieldSx } from '../../theme/colors';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  minWidth?: number | string;
}

const SearchBar = memo(({
  value,
  onChange,
  placeholder = 'Search...',
  width = 240,
  minWidth,
}: SearchBarProps) => {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        width: { xs: '100%', sm: width },
        ...(minWidth ? { minWidth } : {}),
        ...fieldSx,
      }}
    />
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
