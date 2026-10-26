import { memo } from 'react';
import { Tooltip, IconButton, type TooltipProps } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface InfoTooltipProps {
  title: TooltipProps['title'];
  placement?: TooltipProps['placement'];
  size?: 'small' | 'medium';
  iconSize?: number;
  color?: string;
}

const InfoTooltip = memo(({
  title,
  placement = 'top',
  size = 'small',
  iconSize = 16,
  color = 'text.secondary'
}: InfoTooltipProps) => {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <IconButton
        size={size}
        sx={{
          p: 0.5,
          color,
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: iconSize }} />
      </IconButton>
    </Tooltip>
  );
});

InfoTooltip.displayName = 'InfoTooltip';

export default InfoTooltip;
