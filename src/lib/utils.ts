import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fmtDate(d: Date | string) {
  return format(new Date(d), "EEE, d MMM yyyy");
}

export function fmtShort(d: Date | string) {
  return format(new Date(d), "d MMM");
}

export function fmtDay(d: Date | string) {
  return format(new Date(d), "EEE");
}

export function fmtTime(d: Date | string) {
  return format(new Date(d), "h:mm a");
}

export function fmtDateTime(d: Date | string) {
  return format(new Date(d), "EEE, d MMM · h:mm a");
}

export function timeUntil(d: Date | string) {
  const date = new Date(d);
  if (isPast(date)) return "ended";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function inr(amount: number) {
  if (!amount || amount === 0) return "Free";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function toDatetimeLocal(d: Date | string) {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function plural(n: number, word: string, words?: string) {
  return `${n} ${n === 1 ? word : words ?? word + "s"}`;
}
