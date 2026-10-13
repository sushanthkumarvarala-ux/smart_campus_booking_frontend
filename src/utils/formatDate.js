import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateStr, formatPattern = 'MMM dd, yyyy') => {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(date) ? format(date, formatPattern) : dateStr;
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  return formatDate(dateStr, 'MMM dd, yyyy • h:mm a');
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    // If time is like "08:00:00" or "08:00"
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = minutes || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 === 0 ? 12 : h % 12;
    return `${formattedH}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const formatTimeRange = (startStr, endStr) => {
  if (!startStr || !endStr) return '';
  try {
    const start = typeof startStr === 'string' ? parseISO(startStr) : startStr;
    const end = typeof endStr === 'string' ? parseISO(endStr) : endStr;
    if (isValid(start) && isValid(end)) {
      return `${format(start, 'MMM dd, yyyy • h:mm a')} - ${format(end, 'h:mm a')}`;
    }
  } catch {
    // fallback
  }
  return `${startStr} - ${endStr}`;
};
