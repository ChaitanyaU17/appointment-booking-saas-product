import { alpha } from '@mui/material/styles';

export const ACCENT = '#659287';
export const ACCENT_DARK = '#4a6b62';
export const ACCENT_LIGHT = '#88BDA4';
export const ACCENT_SOFT = alpha(ACCENT, 0.08);
export const ACCENT_BORDER = alpha(ACCENT, 0.25);

export const SURFACE = '#ffffff';
export const PAGE_BG = '#f6f8f7';
export const BORDER = '#e6e9ef';
export const MUTED = '#64748b';
export const INK = '#0f172a';

export const SUCCESS = '#059669';
export const SUCCESS_SOFT = '#ecfdf5';
export const SUCCESS_BORDER = '#a7f3d0';

export const WARNING = '#d97706';
export const WARNING_SOFT = '#fffbeb';
export const WARNING_BORDER = '#fde68a';

export const INFO = '#2563eb';
export const INFO_SOFT = '#eff6ff';
export const INFO_BORDER = '#bfdbfe';

export const ERROR = '#dc2626';
export const ERROR_SOFT = '#fef2f2';
export const ERROR_BORDER = '#fecaca';

export const VIOLET = '#7c3aed';
export const VIOLET_SOFT = '#f5f3ff';
export const VIOLET_BORDER = '#ddd6fe';

export const NEUTRAL = '#64748b';
export const NEUTRAL_SOFT = '#f1f5f9';
export const NEUTRAL_BORDER = '#e2e8f0';

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    fontSize: 13.5,
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ACCENT, 0.5) },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 1.5 },
  },
  '& .MuiOutlinedInput-input': { py: 1 },
} as const;
