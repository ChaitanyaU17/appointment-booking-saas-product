import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, Container, Grid, Card, Chip, Paper, Avatar,
  Accordion, AccordionSummary, AccordionDetails, Rating, Skeleton,
  Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchPublicPlans } from '../../features/public/publicSlice';
import api from '../../services/api';
import { motion, AnimatePresence, useInView, animate, useMotionValue, useTransform } from 'framer-motion';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { type Variants } from 'framer-motion';


function Counter({ value, suffix = '', duration = 1.8 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [8, -8]);
  const rotateY = useTransform(x, [-120, 120], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const }}
};

const EyebrowChip = ({ label }: { label: string }) => (
  <Chip
    label={label}
    size="small"
    sx={{ mb: 2, fontWeight: 800, letterSpacing: '0.06em', fontSize: '0.7rem', color: 'primary.main', bgcolor: 'rgba(101,146,135,0.1)', px: 1}}
  />
);

const marqueeItems = [
  'Hair Salons', 'Dental Clinics', 'Business Consultants', 'Personal Trainers',
  'Tutors & Coaching Classes', 'Photography Studios', 'Therapists', 'Spas & Wellness',
];

function Marquee() {
  return (
    <Box sx={{ overflow: 'hidden', py: 3, borderTop: '1px solid rgba(15,23,42,0.06)', borderBottom: '1px solid rgba(15,23,42,0.06)', bgcolor: '#fff' }}>
      <motion.div
        style={{ display: 'flex', gap: 48, width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, whiteSpace: 'nowrap' }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>{item}</Typography>
          </Box>
        ))}
      </motion.div>
    </Box>
  );
}

const demoMeta = [
  { label: 'Choose a service', caption: 'They see your services, durations and prices — no back-and-forth texts needed.' },
  { label: 'Pick an open slot', caption: 'Only real availability shows up, pulled live from your connected calendar.' },
  { label: "It's confirmed", caption: 'Calendar invite, Meet link and confirmation — sent automatically, instantly.' },
];

function BookingDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % demoMeta.length), 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Chip
          icon={<PlayArrowIcon />}
          label="Live interactive preview"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, mb: 3, borderWidth: 1.5 }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '2.6rem' } }}>
          Watch a real booking happen
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4 }}>
          This is the exact flow your customers go through on your booking page. No exaggeration, three steps, zero phone calls.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {demoMeta.map((m, i) => (
            <Box
              key={m.label}
              onClick={() => setStep(i)}
              sx={{
                display: 'flex', gap: 2, p: 2, borderRadius: 3, cursor: 'pointer',
                bgcolor: step === i ? 'white' : 'transparent',
                boxShadow: step === i ? '0 10px 30px rgba(15,23,42,0.08)' : 'none',
                border: '1px solid', borderColor: step === i ? 'rgba(101,146,135,0.25)' : 'transparent',
                transition: 'all 0.35s ease',
              }}
            >
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: step === i ? 'primary.main' : '#e2e8f0',
                color: step === i ? 'white' : 'text.secondary',
                fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s ease',
              }}>
                {i + 1}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{m.label}</Typography>
                <Typography variant="body2" color="text.secondary">{m.caption}</Typography>
                {step === i && (
                  <Box sx={{ mt: 1.2, height: 3, borderRadius: 2, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                    <motion.div
                      key={step}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3.6, ease: 'linear' }}
                      style={{ height: '100%', background: '#659287' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 40px 80px -30px rgba(15,23,42,0.35)' }}>
          <Box sx={{ bgcolor: '#0f172a', px: 2, py: 1.3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.7 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f87171' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fbbf24' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34d399' }} />
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                slotify.app/b/glow-studio-salon
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 4 }, minHeight: 380, bgcolor: '#fafbfc' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {step === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { name: 'Haircut & Style', time: '45 min', price: '₹599', active: false },
                      { name: 'Beard Grooming', time: '20 min', price: '₹299', active: true },
                      { name: 'Full Spa Package', time: '90 min', price: '₹1,499', active: false },
                    ].map((s, i) => (
                      <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
                        <Box sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          p: 1.8, borderRadius: 2.5, border: '2px solid',
                          borderColor: s.active ? 'primary.main' : '#e2e8f0',
                          bgcolor: s.active ? 'rgba(101,146,135,0.07)' : 'white',
                        }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.time}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{s.price}</Typography>
                            {s.active && <CheckCircleIcon color="primary" fontSize="small" />}
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                )}

                {step === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
                      {['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'].map((d, i) => (
                        <Box key={d} sx={{
                          minWidth: 64, textAlign: 'center', py: 1.2, borderRadius: 2.5,
                          bgcolor: i === 2 ? 'primary.main' : '#f1f5f9',
                          color: i === 2 ? 'white' : 'text.primary',
                          fontWeight: 700, fontSize: '0.8rem',
                        }}>
                          {d}
                        </Box>
                      ))}
                    </Box>
                    <Grid container spacing={1.2}>
                      {['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '3:30 PM', '5:00 PM'].map((t, i) => (
                        <Grid size={{ xs: 4 }} key={t}>
                          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                            <Box sx={{
                              py: 1.4, textAlign: 'center', borderRadius: 2, fontWeight: 600, fontSize: '0.8rem',
                              border: '1.5px solid', borderColor: i === 4 ? 'primary.main' : '#e2e8f0',
                              bgcolor: i === 4 ? 'primary.main' : 'white',
                              color: i === 4 ? 'white' : 'text.primary',
                            }}>
                              {t}
                            </Box>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {step === 2 && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
                    </motion.div>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>You're all set, Chaitanya!</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Wed 14 Feb · 3:30 PM – 3:50 PM
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, textAlign: 'left', bgcolor: '#f8fafc', borderRadius: 2.5, p: 2 }}>
                      {[
                        { icon: <VideocamIcon fontSize="small" color="primary" />, text: 'Google Meet link generated' },
                        { icon: <CalendarMonthIcon fontSize="small" color="primary" />, text: 'Added to your Google Calendar' },
                        { icon: <NotificationsActiveIcon fontSize="small" color="primary" />, text: 'Confirmation sent to customer' },
                      ].map((row, i) => (
                        <motion.div
                          key={row.text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.15 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                        >
                          {row.icon}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.text}</Typography>
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

const industries = [
  { name: 'Salons & Barbershops', img: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=700&q=80&auto=format&fit=crop' },
  { name: 'Clinics & Doctors', img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=700&q=80&auto=format&fit=crop' },
  { name: 'Consultants & Coaches', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&q=80&auto=format&fit=crop' },
  { name: 'Gyms & Personal Trainers', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80&auto=format&fit=crop' },
  { name: 'Tutors & Coaching Classes', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80&auto=format&fit=crop' },
  { name: 'Studios & Photographers', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=80&auto=format&fit=crop' },
];

const features = [
  { icon: <CalendarMonthIcon sx={{ fontSize: 30 }} />, title: '24/7 Booking Page', desc: 'Clients book at 11pm on a Sunday if they want to. Your page never closes, even when you do.' },
  { icon: <AutoAwesomeIcon sx={{ fontSize: 30 }} />, title: 'Google Meet, Automatically', desc: 'Connect your calendar once — every online booking gets a Meet link with zero manual work.' },
  { icon: <SpeedIcon sx={{ fontSize: 30 }} />, title: 'Revenue at a Glance', desc: 'See today’s schedule, this month’s earnings and booking trends the moment you log in.' },
  { icon: <QrCodeIcon sx={{ fontSize: 30 }} />, title: 'A QR Code for Your Counter', desc: 'Print it, stick it by the till, and let walk-in customers book their next visit before they leave.' },
  { icon: <SettingsSuggestIcon sx={{ fontSize: 30 }} />, title: 'Walk-ins Fit Right In', desc: 'Add an offline customer straight into your calendar in a few taps — no separate spreadsheet.' },
  { icon: <PersonOutlineIcon sx={{ fontSize: 30 }} />, title: 'Customers Manage Themselves', desc: 'They can view and cancel their own bookings, so you stop fielding "can I reschedule" calls.' },
];

const testimonials = [
  {
    name: 'Ananya Kapoor',
    role: 'Owner, Glow Studio Salon',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    initials: 'AK',
    quote: "I used to spend my mornings replying to 'are you free today?' messages on WhatsApp. Now my calendar fills itself while I'm cutting someone's hair.",
  },
  {
    name: 'Dr. Rohan Mehta',
    role: 'Physiotherapist, Mehta Clinic',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    initials: 'RM',
    quote: 'The Meet link showing up automatically for online consults is the thing that actually sold me. No more copy-pasting links before every call.',
  },
  {
    name: 'Priya Sharma',
    role: 'Career Coach',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    initials: 'PS',
    quote: 'Clients book, show up on time, and I finally stopped double-booking myself by accident. Setup took maybe ten minutes.',
  },
];

const faqs = [
  { q: 'Do my customers need to create an account to book?', a: "No. They just pick a slot and enter their name and phone number. If they sign in with Google, we'll also show their upcoming bookings automatically the next time they visit your page." },
  { q: 'What actually happens when I connect Google Calendar?', a: 'We check your calendar in real time so already-booked slots never show up as available, and for online meetings, a Google Meet link is generated automatically — no manual setup on your end.' },
  { q: 'Can I still add walk-in customers manually?', a: 'Yes. Open your calendar, click an empty slot, and add the walk-in in a few seconds. It shows up right alongside your online bookings in one single view.' },
  { q: 'Is there a limit on services or appointments?', a: 'No limits. Add as many services, prices and durations as you like, and take as many bookings as your day allows.' },
  { q: 'How long does setup actually take?', a: 'Most businesses are live in under five minutes — add your working hours, a service or two, connect Google Calendar if you want online meetings, and share your link.' },
];

function PricingSection() {
  const dispatch = useAppDispatch();
  const { plans, plansLoading: loading } = useAppSelector((state) => state.public);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchPublicPlans());
  }, [dispatch]);

  return (
    <Box id="pricing" sx={{ bgcolor: 'white', py: { xs: 9, md: 13 } }}>
      <Container maxWidth="lg">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <EyebrowChip label="PRICING" />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Simple pricing, no surprises
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 400, maxWidth: 560, mx: 'auto' }}>
              Start for free, upgrade when you need more power.
            </Typography>
          </Box>
        </motion.div>

        {loading ? (
          <Grid container spacing={4} sx={{justifyContent: 'center'}}>
            {[1, 2, 3].map(i => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rounded" height={450} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4} sx={{justifyContent: 'center', alignItems: 'stretch'}}>
            {plans.map((plan, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={plan._id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  style={{ height: '100%' }}
                >
                  <Card sx={{
                    height: '100%', p: 4, display: 'flex', flexDirection: 'column',
                    border: plan.price > 0 && i === 1 ? '2px solid' : '1px solid',
                    borderColor: plan.price > 0 && i === 1 ? 'primary.main' : 'rgba(15,23,42,0.08)',
                    boxShadow: plan.price > 0 && i === 1 ? '0 20px 40px rgba(101,146,135,0.15)' : '0 10px 30px rgba(15,23,42,0.03)',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    {plan.price > 0 && i === 1 && (
                      <Chip label="Most Popular" color="primary" size="small" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{plan.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>
                        {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                      </Typography>
                      {plan.price > 0 && <Typography color="text.secondary">/mo</Typography>}
                    </Box>

                    <Button
                      variant={plan.price > 0 && i === 1 ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ mb: 4, fontWeight: 700, borderRadius: 2 }}
                    >
                      {plan.price === 0 ? 'Get Started' : 'Start Free Trial'}
                    </Button>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                        What's included:
                      </Typography>
                      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                          <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{`${plan.features.maxBookingsPerMonth >= 9999 ? 'Unlimited' : plan.features.maxBookingsPerMonth} bookings/mo`}</Typography>} />
                        </ListItem>
                        <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                          <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{`${plan.features.maxServices >= 9999 ? 'Unlimited' : plan.features.maxServices} services`}</Typography>} />
                        </ListItem>
                        {plan.features.maxAdmins > 1 && (
                          <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{`Up to ${plan.features.maxAdmins >= 9999 ? 'Unlimited' : plan.features.maxAdmins} admins`}</Typography>} />
                          </ListItem>
                        )}
                        {plan.features.googleCalendarSync && (
                          <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Google Calendar Sync</Typography>} />
                          </ListItem>
                        )}
                        {plan.features.googleMeetIntegration && (
                          <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Auto Google Meet Links</Typography>} />
                          </ListItem>
                        )}
                        {plan.features.customBranding && (
                          <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Custom Branding</Typography>} />
                          </ListItem>
                        )}
                        {plan.features.prioritySupport && (
                          <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Priority Support</Typography>} />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Box sx={{ bgcolor: '#f8fafc', pt: { xs: 8, md: 11 }, pb: { xs: 10, md: 16 }, position: 'relative' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <Chip
                  icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />}
                  label="New: automatic Google Meet links on every booking"
                  size="small"
                  sx={{ mb: 3, fontWeight: 700, bgcolor: 'rgba(101,146,135,0.1)', color: 'primary.dark', px: 1 }}
                />
                <Typography variant="h2" component="h1" gutterBottom color="text.primary" sx={{ fontWeight: 800, lineHeight: 1.08, fontSize: { xs: '2.4rem', sm: '3rem', md: '3.4rem' } }}>
                  Stop losing bookings to <Box component="span" color="primary.main">missed calls</Box>.
                </Typography>
                <Typography variant="h6" color="textSecondary" component="p" sx={{ mb: 4, fontWeight: 400, maxWidth: 480 }}>
                  Slotify gives your business a booking page that works while you sleep — synced to your real calendar, with Meet links, reminders and walk-ins handled for you.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    variant="contained" color="primary" size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/login')}
                    sx={{ px: 4, py: 1.6, fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    Start free — takes 5 minutes
                  </Button>
                  <Button
                    variant="outlined" color="primary" size="large"
                    href="#demo"
                    sx={{ px: 4, py: 1.6, fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    See how it works
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex' }}>
                    {['https://randomuser.me/api/portraits/women/68.jpg', 'https://randomuser.me/api/portraits/men/32.jpg', 'https://randomuser.me/api/portraits/women/44.jpg'].map((src, i) => (
                      <Avatar key={i} src={src} sx={{ width: 34, height: 34, ml: i === 0 ? 0 : -1.2, border: '2px solid white' }} />
                    ))}
                  </Box>
                  <Box>
                    <Rating value={5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Trusted by 500+ businesses
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative', maxWidth: 420, mx: 'auto' }}>
                <Box sx={{ position: 'absolute', top: -30, right: -20, width: 260, height: 260, bgcolor: 'primary.light', borderRadius: '50%', opacity: 0.3, filter: 'blur(50px)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: -40, left: -20, width: 300, height: 300, bgcolor: 'secondary.light', borderRadius: '50%', opacity: 0.25, filter: 'blur(60px)', zIndex: 0 }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <TiltCard>
                    <Paper elevation={0} sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 40px 80px -25px rgba(15,23,42,0.3)', bgcolor: 'white' }}>
                      <Box sx={{
                        height: 130, position: 'relative',
                        backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop), linear-gradient(135deg,#659287,#88BDA4)',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                      }}>
                        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.15), rgba(15,23,42,0.6))' }} />
                        <Box sx={{ position: 'absolute', bottom: 14, left: 20, color: 'white' }}>
                          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>Glow Studio Salon</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>Book an appointment</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Beard Grooming · 20 min</Typography>
                          <Chip label="Today" size="small" color="primary" />
                        </Box>
                        <Grid container spacing={1}>
                          {['09:00', '10:00', '11:30', '01:00', '02:30', '04:00'].map((time, i) => (
                            <Grid size={{ xs: 4 }} key={i}>
                              <Box sx={{
                                p: 1.2, textAlign: 'center', borderRadius: 2, fontWeight: 600, fontSize: '0.78rem',
                                bgcolor: i === 4 ? 'primary.main' : '#f8fafc',
                                color: i === 4 ? 'white' : 'text.primary',
                                border: '1px solid', borderColor: i === 4 ? 'primary.main' : '#e2e8f0',
                              }}>
                                {time}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2.5, py: 1.3, fontWeight: 700 }}>
                          Confirm booking
                        </Button>
                      </Box>
                    </Paper>

                    <motion.div
                      style={{ position: 'absolute', top: -18, right: -30 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Paper sx={{ px: 1.8, py: 1, borderRadius: 3, display: 'flex', gap: 1, alignItems: 'center', boxShadow: '0 14px 28px rgba(15,23,42,0.18)', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Booking confirmed</Typography>
                      </Paper>
                    </motion.div>

                    <motion.div
                      style={{ position: 'absolute', bottom: 24, left: -34 }}
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    >
                      <Paper sx={{ px: 1.8, py: 1, borderRadius: 3, display: 'flex', gap: 1, alignItems: 'center', boxShadow: '0 14px 28px rgba(15,23,42,0.18)', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}>
                        <VideocamIcon color="primary" fontSize="small" />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Meet link added</Typography>
                      </Paper>
                    </motion.div>
                  </TiltCard>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Marquee />

      <Box id="demo" sx={{ py: { xs: 9, md: 13 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <BookingDemo />
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}><Counter value={500} suffix="+" /></Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Active Businesses</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}><Counter value={12400} suffix="+" /></Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Monthly Bookings</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>5 min</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Average Setup Time</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>4.9/5</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Average Owner Rating</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 } }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <EyebrowChip label="WHO IT'S FOR" />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Built for businesses that run on appointments
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 400, maxWidth: 560, mx: 'auto' }}>
              If people need to book time with you, Slotify was made for you.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {industries.map((ind, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ind.name}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Box sx={{
                  position: 'relative', height: 220, borderRadius: 4, overflow: 'hidden',
                  backgroundImage: `url(${ind.img}), linear-gradient(135deg,#659287,#88BDA4)`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: '0 12px 30px rgba(15,23,42,0.1)', cursor: 'default',
                }}>
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.82) 100%)' }} />
                  <Typography variant="h6" sx={{ position: 'absolute', bottom: 18, left: 20, right: 20, color: 'white', fontWeight: 700 }}>
                    {ind.name}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 9, md: 13 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <EyebrowChip label="FEATURES" />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                Everything you need, nothing you don't
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {features.map((feat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feat.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  whileHover={{ y: -6 }}
                  style={{ height: '100%' }}
                >
                  <Card sx={{ height: '100%', p: 3.5 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 3, mb: 2.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'rgba(101,146,135,0.1)', color: 'primary.main',
                    }}>
                      {feat.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>{feat.title}</Typography>
                    <Typography color="textSecondary">{feat.desc}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <PricingSection />

      <Container maxWidth="md" sx={{ py: { xs: 9, md: 13 } }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <EyebrowChip label="HOW IT WORKS" />
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Three steps. No training required.
            </Typography>
          </Box>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { n: '1', title: 'Set up your page', desc: 'Add your working hours, services and prices. Connect Google Calendar if you take online meetings.' },
            { n: '2', title: 'Share your link', desc: 'Send your booking link over WhatsApp, put it on Instagram, or print the QR code for your counter.' },
            { n: '3', title: 'Get booked, automatically', desc: 'Confirmations, reminders and Meet links go out on their own. You just show up.' },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55 }}
            >
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  bgcolor: 'primary.main', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800,
                }}>
                  {s.n}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{s.title}</Typography>
                  <Typography color="textSecondary" sx={{ maxWidth: 520 }}>{s.desc}</Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 9, md: 13 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <EyebrowChip label="LOVED BY BUSY OWNERS" />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                Don't take our word for it
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {testimonials.map((t, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={t.name}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  style={{ height: '100%' }}
                >
                  <Card sx={{ height: '100%', p: 3.5, display: 'flex', flexDirection: 'column' }}>
                    <Rating value={5} readOnly size="small" sx={{ mb: 2 }} />
                    <Typography sx={{ fontStyle: 'italic', mb: 3, flexGrow: 1, color: 'text.primary' }}>
                      "{t.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={t.avatar}>{t.initials}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 9, md: 13 } }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <EyebrowChip label="QUESTIONS" />
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Good questions, honest answers
            </Typography>
          </Box>
        </motion.div>

        {faqs.map((f, i) => (
          <motion.div
            key={f.q}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important', mb: 1.5, '&:before': { display: 'none' }, overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        ))}
      </Container>

      <Box sx={{
        position: 'relative', py: { xs: 10, md: 14 },
        backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop), linear-gradient(135deg,#4a6b62,#659287)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15,23,42,0.72)' }} />
        <Container maxWidth="sm" sx={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '2.6rem' } }}>
              Ready to stop chasing bookings?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, mb: 4 }}>
              Set up your page today and let the next five customers book themselves.
            </Typography>
            <Button
              variant="contained" color="primary" size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 5, py: 1.7, fontSize: '1.1rem', fontWeight: 700, mb: 4 }}
            >
              Start free — no credit card needed
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', opacity: 0.9 }}>
              {['5-minute setup', 'Cancel anytime', 'Works on any device'].map((t) => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{t}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}