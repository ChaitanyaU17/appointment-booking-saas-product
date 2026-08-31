import { useState, useEffect, Fragment } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hook';
import { closeNotification } from '../../features/notifications/notificationSlice';

import { useTheme } from '@mui/material/styles';

export default function NotificationSnackbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { open, message, failure, actionPath } = useAppSelector((state) => state.notification);

  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (open && message && message.trim().length > 0) {
      timer = setTimeout(() => {
        setShowSnackbar(true);
      }, 500);
    } else {
      setShowSnackbar(false);
    }

    return () => clearTimeout(timer);
  }, [open, message]);

  const handleClose = () => {
    dispatch(closeNotification());
    setShowSnackbar(false);
  };

  const handleAction = () => {
    if (actionPath) {
      navigate(actionPath);
      handleClose();
    }
  };

  const action = (
    <Fragment>
      {actionPath && (
        <Button
          size="small"
          onClick={handleAction}
          sx={{color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': {backgroundColor: 'rgba(255, 255, 255, 0.2)'}, mr: 1}}
        >
          VIEW
        </Button>
      )}
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={showSnackbar}
      autoHideDuration={6000}
      onClose={handleClose}
      message={message}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: !failure ? theme.palette.primary.main : theme.palette.error.main,
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '8px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          minWidth: '300px',
          fontSize: '0.95rem',
          fontWeight: 500,
          '& .MuiSnackbarContent-message': {
            display: 'flex',
            alignItems: 'center',
          },
        },
      }}
      action={action}
    />
  );
}
