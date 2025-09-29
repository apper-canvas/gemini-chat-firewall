import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, h:mm a");
  }
};

export const formatRelativeTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatDate = (timestamp, formatStr = "PPP") => {
  return format(new Date(timestamp), formatStr);
};