import { useState } from 'react';
import { Tooltip, IconButton, Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InfoIcon from '@mui/icons-material/Info';

interface InfoTooltipProps {
  title: string;
}

export default function InfoTooltip({ title }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={title} arrow placement="top">
        <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }} onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={(e) => { 
          if(e && (e as any).stopPropagation) (e as any).stopPropagation(); 
          setOpen(false); 
        }} 
        maxWidth="xs" 
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <InfoIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1">
            {title}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            onClick={(e) => { e.stopPropagation(); setOpen(false); }} 
            color="primary"
          >
            OK, got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
