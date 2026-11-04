export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export type EventCardData = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  mode: string;
  city: string;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  registrationDeadline: Date;
  capacity: number;
  feeInr: number;
  prizePool: string | null;
  tags: string[];
  status: string;
  featured: number;
  hue: number;
  hostShortName: string;
  hostName: string;
  hostCollegeId: string;
  organizerId: string;
  registered: number;
  isRegistered?: boolean;
};
