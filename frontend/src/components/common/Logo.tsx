import { Box, Typography } from '@mui/material';

export default function Logo({ size = 'medium', color = 'primary' }: { size?: 'small' | 'medium' | 'large', color?: 'primary' | 'white' }) {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  const typographyVariant = size === 'small' ? 'h6' : size === 'large' ? 'h3' : 'h5';
  
  const iconColor = color === 'primary' ? 'primary.main' : 'white';
  const textColor = color === 'primary' ? 'text.primary' : 'white';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: size === 'small' ? 1 : 1.5, userSelect: 'none', color: iconColor }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="40" height="34" rx="8" fill={color === 'primary' ? 'currentColor' : 'white'} fillOpacity={color === 'primary' ? 0.1 : 0.2}/>
        <path d="M14 4V12M34 4V12" stroke={color === 'primary' ? 'currentColor' : 'white'} strokeWidth="4" strokeLinecap="round"/>
        <rect x="4" y="20" width="40" height="22" rx="6" fill={color === 'primary' ? 'currentColor' : 'white'}/>
        <circle cx="24" cy="31" r="5" fill={color === 'primary' ? 'white' : '#659287'}/>
      </svg>
      <Typography variant={typographyVariant} sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: textColor, display: 'flex', alignItems: 'center' }}>
        Slotify
      </Typography>
    </Box>
  );
}
