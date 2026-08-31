
export const generateICS = (appointment: any, businessName: string) => {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const stamp = formatDate(new Date());

  const location = appointment.type === 'Google Meet' && appointment.meetLink 
    ? appointment.meetLink 
    : 'In-person';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Slotify//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${stamp}`,
    `UID:${appointment._id || stamp}@slotify.io`,
    `SUMMARY:${appointment.title} with ${businessName}`,
    `DESCRIPTION:Appointment: ${appointment.title}\\nService: ${appointment.title}\\nStatus: ${appointment.status}\\n\\nBooked via Slotify`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `appointment-${appointment._id || 'slotify'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
