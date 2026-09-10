import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { EventData, Step } from 'react-joyride';
import { useAppSelector } from '../../hook';
import { Box, Typography, useTheme } from '@mui/material';

const DemoTour: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [run, setRun] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    if (user?.isDemoAccount && !localStorage.getItem('demoTourCompleted')) {
      setTimeout(() => setRun(true), 400);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>Welcome to your Command Center!</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Instead of just showing you buttons, let's look at the big picture. In the next 3 steps, we'll show you how this system turns visitors into booked clients on autopilot.
          </Typography>
        </Box>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-nav-settings',
      content: (
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>Step 1: Set Your Rules</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            It all starts here. Configure your services, set your working hours, and connect your Google Calendar so you never get double-booked.
          </Typography>
        </Box>
      ),
      placement: 'right',
    },
    {
      target: '#tour-kpi',
      content: (
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>Step 2: Share & Grow</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Once set up, you'll share your unique Public Booking Page. Watch these metrics automatically update as your clients book themselves 24/7.
          </Typography>
        </Box>
      ),
      placement: 'bottom',
    },
    {
      target: '#tour-appointments',
      content: (
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>Step 3: Manage Your Day</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your new appointments will drop right here. You can easily see who is coming in today, process payments, or quickly add walk-ins.
          </Typography>
        </Box>
      ),
      placement: 'top',
    },
    {
      target: '#tour-nav-appointments',
      content: (
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>Ready to dive in?</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Click here to view your full Calendar, or jump into Settings to finish setting up your account. The system is yours!
          </Typography>
        </Box>
      ),
      placement: 'right',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('demoTourCompleted', 'true');
    }
  };

  const joyrideProps: any = {
    onEvent: handleJoyrideEvent,
    continuous: true,
    hideCloseButton: false,
    run,
    scrollToFirstStep: true,
    showProgress: true,
    showSkipButton: true,
    steps,
    styles: {
      options: {
        zIndex: 10000,
        primaryColor: theme.palette.primary.main,
        textColor: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,
        arrowColor: theme.palette.background.paper,
      },
      tooltip: {
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12)',
        padding: '24px',
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      },
      buttonNext: {
        borderRadius: '8px',
        fontWeight: 600,
        padding: '8px 16px',
      },
      buttonBack: {
        marginRight: '8px',
        color: theme.palette.text.secondary,
      },
      buttonSkip: {
        color: theme.palette.text.secondary,
        fontWeight: 600,
      }
    }
  };

  if (!user?.isDemoAccount) return null;

  return <Joyride {...joyrideProps} />;
};

export default DemoTour;