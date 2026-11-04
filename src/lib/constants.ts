import {
  Code2,
  Cpu,
  Music4,
  Sparkles,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type EventCategory =
  | "hackathon"
  | "cultural"
  | "sports"
  | "workshop"
  | "tech_talk"
  | "fest";

export type EventMode = "in_person" | "online" | "hybrid";

export type EventStatus = "draft" | "published" | "cancelled";

export interface CategoryMeta {
  slug: EventCategory;
  label: string;
  icon: LucideIcon;
  hue: number;
  text: string; // tailwind text color
  bg: string; // tailwind soft bg
  ring: string;
  chip: string; // chip classes
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "hackathon",
    label: "Hackathon",
    icon: Code2,
    hue: 258,
    text: "text-violet-700",
    bg: "bg-violet-100",
    ring: "ring-violet-600/20",
    chip: "bg-violet-100 text-violet-800 ring-violet-600/20",
  },
  {
    slug: "cultural",
    label: "Culturals",
    icon: Music4,
    hue: 330,
    text: "text-rose-700",
    bg: "bg-rose-100",
    ring: "ring-rose-600/20",
    chip: "bg-rose-100 text-rose-800 ring-rose-600/20",
  },
  {
    slug: "sports",
    label: "Sports",
    icon: Trophy,
    hue: 152,
    text: "text-emerald-700",
    bg: "bg-emerald-100",
    ring: "ring-emerald-600/20",
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  },
  {
    slug: "workshop",
    label: "Workshop",
    icon: Wrench,
    hue: 32,
    text: "text-amber-700",
    bg: "bg-amber-100",
    ring: "ring-amber-600/25",
    chip: "bg-amber-100 text-amber-800 ring-amber-600/25",
  },
  {
    slug: "tech_talk",
    label: "Tech Talk",
    icon: Cpu,
    hue: 206,
    text: "text-sky-700",
    bg: "bg-sky-100",
    ring: "ring-sky-600/20",
    chip: "bg-sky-100 text-sky-800 ring-sky-600/20",
  },
  {
    slug: "fest",
    label: "Fest",
    icon: Sparkles,
    hue: 14,
    text: "text-orange-700",
    bg: "bg-orange-100",
    ring: "ring-orange-600/20",
    chip: "bg-orange-100 text-orange-800 ring-orange-600/20",
  },
];

export function categoryMeta(slug: string): CategoryMeta {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

export const MODES: { slug: EventMode; label: string }[] = [
  { slug: "in_person", label: "In-person" },
  { slug: "online", label: "Online" },
  { slug: "hybrid", label: "Hybrid" },
];

export function modeLabel(mode: string) {
  return MODES.find((m) => m.slug === mode)?.label ?? "In-person";
}

export const APP_NAME = "Univibe";
export const APP_TAGLINE = "Every campus. Every event. One home.";
