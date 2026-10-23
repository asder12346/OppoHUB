export function calculateDeadlineInfo(deadlineIso: string): {
  daysLeft: number;
  formattedDate: string;
  isUrgent: boolean; // <= 7 days
  isCritical: boolean; // <= 2 days
  isPassed: boolean;
  statusText: string;
} {
  const deadlineDate = new Date(deadlineIso + 'T23:59:59');
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = isNaN(deadlineDate.getTime()) ? deadlineIso : deadlineDate.toLocaleDateString('en-US', options);

  if (daysLeft < 0) {
    return {
      daysLeft,
      formattedDate,
      isUrgent: false,
      isCritical: false,
      isPassed: true,
      statusText: 'Application Closed'
    };
  }

  if (daysLeft === 0) {
    return {
      daysLeft,
      formattedDate,
      isUrgent: true,
      isCritical: true,
      isPassed: false,
      statusText: 'Closing Today'
    };
  }

  if (daysLeft <= 2) {
    return {
      daysLeft,
      formattedDate,
      isUrgent: true,
      isCritical: true,
      isPassed: false,
      statusText: `${daysLeft} days left`
    };
  }

  if (daysLeft <= 7) {
    return {
      daysLeft,
      formattedDate,
      isUrgent: true,
      isCritical: false,
      isPassed: false,
      statusText: `${daysLeft} days left`
    };
  }

  return {
    daysLeft,
    formattedDate,
    isUrgent: false,
    isCritical: false,
    isPassed: false,
    statusText: `${daysLeft} days left`
  };
}

// Generate an .ics calendar file to let users add deadline directly to Google Calendar or iCal
export function downloadCalendarEvent(title: string, organization: string, deadlineIso: string, url: string) {
  const cleanDate = deadlineIso.replace(/-/g, '');
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpportunityRadar//Application Deadline//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:DEADLINE: ${title.replace(/[\\;,\n]/g, ' ')}`,
    `DESCRIPTION:Application deadline for ${title} organized by ${organization}. Apply or review at: ${url}`,
    `URL:${url}`,
    `DTSTART;VALUE=DATE:${cleanDate}`,
    `DTEND;VALUE=DATE:${cleanDate}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}_deadline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
