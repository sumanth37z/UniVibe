import { randomBytes, scryptSync } from "node:crypto";
import { count } from "drizzle-orm";

import { db } from "@/db";
import { colleges, events, registrations, users } from "@/db/schema";

function seedHashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const uid = (prefix: string, n: number) =>
  `${prefix}0000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const day = 24 * 3600 * 1000;
const hour = 3600 * 1000;

function at(daysFromNow: number, atHour = 10, minute = 0) {
  const d = new Date(Date.now() + daysFromNow * day);
  d.setHours(atHour, minute, 0, 0);
  return d;
}

// deterministic PRNG so repeated seeds produce the same world
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type CollegeSeed = {
  n: number;
  name: string;
  short: string;
  city: string;
  state: string;
  website: string;
  hue: number;
};

const COLLEGES: CollegeSeed[] = [
  { n: 1, name: "Indian Institute of Technology Bombay", short: "IITB", city: "Mumbai", state: "Maharashtra", website: "iitb.ac.in", hue: 222 },
  { n: 2, name: "Indian Institute of Technology Delhi", short: "IITD", city: "New Delhi", state: "Delhi", website: "iitd.ac.in", hue: 355 },
  { n: 3, name: "National Institute of Technology Trichy", short: "NITT", city: "Tiruchirappalli", state: "Tamil Nadu", website: "nitt.edu", hue: 258 },
  { n: 4, name: "BITS Pilani, Goa Campus", short: "BITS Goa", city: "Goa", state: "Goa", website: "bits-pilani.ac.in", hue: 190 },
  { n: 5, name: "Vellore Institute of Technology", short: "VIT", city: "Vellore", state: "Tamil Nadu", website: "vit.ac.in", hue: 210 },
  { n: 6, name: "Manipal Institute of Technology", short: "Manipal", city: "Manipal", state: "Karnataka", website: "manipal.edu", hue: 24 },
  { n: 7, name: "Christ University", short: "Christ", city: "Bengaluru", state: "Karnataka", website: "christuniversity.in", hue: 262 },
  { n: 8, name: "RV College of Engineering", short: "RVCE", city: "Bengaluru", state: "Karnataka", website: "rvce.edu.in", hue: 0 },
  { n: 9, name: "PSG College of Technology", short: "PSG Tech", city: "Coimbatore", state: "Tamil Nadu", website: "psgtech.edu", hue: 152 },
  { n: 10, name: "Shri Ram College of Commerce", short: "SRCC", city: "New Delhi", state: "Delhi", website: "srcc.edu", hue: 46 },
  { n: 11, name: "St. Xavier's College", short: "Xavier's", city: "Mumbai", state: "Maharashtra", website: "xaviers.ac.in", hue: 286 },
  { n: 12, name: "SRM Institute of Science & Technology", short: "SRM", city: "Chennai", state: "Tamil Nadu", website: "srmist.edu.in", hue: 18 },
];

type UserSeed = {
  n: number;
  name: string;
  email: string;
  role: "student" | "organizer";
  collegeN: number;
  bio?: string;
  hue: number;
};

const ORGANIZERS: UserSeed[] = [
  { n: 1, name: "Aarav Khanna", email: "aarav@iitb.in", role: "organizer", collegeN: 1, bio: "Tech secretary, IIT Bombay. If it ships at Techfest, I probably touched it.", hue: 222 },
  { n: 2, name: "Diya Ramesh", email: "diya@vit.in", role: "organizer", collegeN: 5, bio: "Events lead at VIT. Riviera '26 core committee.", hue: 340 },
  { n: 3, name: "Kabir Malhotra", email: "kabir@iitd.in", role: "organizer", collegeN: 2, bio: "BSA + Coding Club, IIT Delhi. Organizer of everything loud.", hue: 12 },
  { n: 4, name: "Isha Fernandes", email: "isha@christ.in", role: "organizer", collegeN: 7, bio: "Cultural head, Christ University. Stage lights are a love language.", hue: 300 },
  { n: 5, name: "Arjun Shetty", email: "arjun@manipal.in", role: "organizer", collegeN: 6, bio: "Sports + gaming circle, Manipal. Beach town, big arenas.", hue: 152 },
  { n: 6, name: "Rhea Subramaniam", email: "rhea@nitt.in", role: "organizer", collegeN: 3, bio: "Festember & Pragyan crew, NIT Trichy.", hue: 258 },
  { n: 7, name: "Ananya Iyer", email: "ananya@bitsgoa.in", role: "organizer", collegeN: 4, bio: "Waves + Quark organizing, BITS Goa. Yes, the beach is real.", hue: 190 },
  { n: 8, name: "Karthik Menon", email: "karthik@rvce.in", role: "organizer", collegeN: 8, bio: "IEEE RVCE. Hardware, kernels, and cold coffee.", hue: 355 },
  { n: 9, name: "Preethi Natarajan", email: "preethi@psgtech.in", role: "organizer", collegeN: 9, bio: "Fine Arts Club, PSG Tech. Coimbatore keeps it classy.", hue: 30 },
  { n: 10, name: "Zoya Khan", email: "zoya@srcc.in", role: "organizer", collegeN: 10, bio: "Crossroads & societies at SRCC. Spreadsheet romantic.", hue: 46 },
];

const STUDENTS: UserSeed[] = [
  { n: 20, name: "Meera Nair", email: "meera@nitt.in", role: "student", collegeN: 3, bio: "CSE '27. Hackathons first, sleep later.", hue: 258 },
  { n: 21, name: "Rohan Gupta", email: "rohan@bitsgoa.in", role: "student", collegeN: 4, bio: "Econ + drum kits. BITS Goa.", hue: 190 },
  { n: 22, name: "Tara Joseph", email: "tara@iitb.in", role: "student", collegeN: 1, bio: "Aerospace junior, bass guitarist on weekends.", hue: 330 },
  { n: 23, name: "Sameer Patel", email: "sameer@vit.in", role: "student", collegeN: 5, bio: "Debugging is my cardio.", hue: 210 },
  { n: 24, name: "Anika Rao", email: "anika@christ.in", role: "student", collegeN: 7, bio: "B.Com + Western dance society.", hue: 300 },
  { n: 25, name: "Vikram Desai", email: "vikram@manipal.in", role: "student", collegeN: 6, bio: "Goalkeeper, weekend roaster.", hue: 152 },
  { n: 26, name: "Nisha Verma", email: "nisha@iitd.in", role: "student", collegeN: 2, bio: "Designing interfaces and arguments.", hue: 12 },
  { n: 27, name: "Farhan Ali", email: "farhan@xaviers.in", role: "student", collegeN: 11, bio: "Malhar volunteer, Mumbai local connoisseur.", hue: 286 },
  { n: 28, name: "Lakshmi Prakash", email: "lakshmi@srm.in", role: "student", collegeN: 12, bio: "Biotech, badminton, and biryani ratings.", hue: 18 },
  { n: 29, name: "Dev Malhotra", email: "dev@rvce.in", role: "student", collegeN: 8, bio: "8th sem energy with 1st sem curiosity.", hue: 355 },
];

type EventSeed = {
  n: number;
  title: string;
  tagline: string;
  category: string;
  orgN: number; // organizer user n → host college follows organizer
  startDays: number; // negative = past
  startHour: number;
  durationHrs: number;
  deadlineDaysBefore: number;
  venue: string;
  mode: string;
  capacity: number;
  fee: number;
  prize?: string;
  teamMin?: number;
  teamMax?: number;
  tags: string[];
  featured?: boolean;
  status?: string;
  onlineLink?: string;
  description: string;
};

const EVENTS: EventSeed[] = [
  {
    n: 1,
    title: "CodeSprint 6.0 — National 24h Hackathon",
    tagline: "Build something the whole network talks about by Monday.",
    category: "hackathon",
    orgN: 1, startDays: 21, startHour: 9, durationHrs: 26, deadlineDaysBefore: 3,
    venue: "VMCC & Lecture Halls, IIT Bombay", mode: "in_person",
    capacity: 320, fee: 499, prize: "₹1,50,000 + incubation offers", teamMin: 2, teamMax: 4,
    tags: ["ai", "web3", "react", "open-innovation"], featured: true,
    description:
      "CodeSprint is IIT Bombay's flagship open-innovation hackathon. Twenty-four hours, three tracks — AI for Bharat, Fintech Rails, and Wildcard. Mentors from five unicorn engineering teams float through the halls all night.\nBring your laptop, a charger, and a team you can argue with at 4 AM. Meals, midnight chai and bean bags are on us. Top three teams fast-track into the SINE incubation interview.",
  },
  {
    n: 2,
    title: "ChainShift: Web3 Build Week (Online)",
    tagline: "Seven evenings. One deployed dApp. Zero excuses.",
    category: "hackathon",
    orgN: 2, startDays: 14, startHour: 19, durationHrs: 2, deadlineDaysBefore: 1,
    venue: "Discord + Devfolio", mode: "online",
    capacity: 800, fee: 0, prize: "₹60,000 bounty pool", teamMin: 1, teamMax: 3,
    tags: ["web3", "solidity", "defi"],
    description:
      "A week-long online build sprint for teams who want to ship on-chain. Every evening has a one-hour workshop — wallets, indexing, auditing — followed by open build hours with mentors on-call.\nTeams deploy to a public testnet by Sunday midnight. Judged on working code only; slideware need not apply.",
  },
  {
    n: 3,
    title: "AgriTech Hack '26",
    tagline: "Farmers have problems. You have prototypes.",
    category: "hackathon",
    orgN: 6, startDays: 34, startHour: 8, durationHrs: 30, deadlineDaysBefore: 4,
    venue: "Golden Jubilee Convention Centre, NITT", mode: "in_person",
    capacity: 200, fee: 299, prize: "₹75,000 + pilot farms access", teamMin: 2, teamMax: 5,
    tags: ["iot", "agritech", "ml", "hardware"],
    description:
      "NIT Trichy's hardware-forward hackathon in partnership with two farmer producer organisations. Problem statements are written by farmers, not pitch decks: soil sensing, mandi price transparency, equipment sharing, and post-harvest loss.\nA stash of ESP32s, soil probes and thermal sensors is free for every team. Working field demos beat slideware, always.",
  },
  {
    n: 4,
    title: "Kernel Panic: Systems Hack Night",
    tagline: "One night, bare metal, pure chaos.",
    category: "hackathon",
    orgN: 8, startDays: 9, startHour: 18, durationHrs: 12, deadlineDaysBefore: 2,
    venue: "CSE Labs, RVCE", mode: "in_person",
    capacity: 90, fee: 99, prize: "₹20,000 + mechanical keyboards", teamMin: 1, teamMax: 2,
    tags: ["rust", "c", "os", "linux"],
    description:
      "A 12-hour overnight systems hack. Build an OS toy, a scheduler, a shell, a debugger — anything that touches the machine. Hosts provide a judge server, unlimited coffee, and zero judgement for segfaults.\nFreshers welcome: there's a guided track where mentors help you write your first kernel module from scratch.",
  },
  {
    n: 5,
    title: "femHacks '26 — Women in Tech Buildathon",
    tagline: "A hackathon run the way hackathons should feel.",
    category: "hackathon",
    orgN: 4, startDays: 47, startHour: 9, durationHrs: 10, deadlineDaysBefore: 5,
    venue: "Central Block, Christ University", mode: "in_person",
    capacity: 160, fee: 0, prize: "₹40,000 + internship interviews", teamMin: 2, teamMax: 4,
    tags: ["women-in-tech", "social-good", "ux"], featured: true,
    description:
      "femHacks is a beginner-friendly buildathon for women and non-binary students across India. Two tracks: 'First Commit' for absolute beginners and 'Full Send' for returning builders.\nEvery team regardless of experience gets a dedicated mentor, and every demo gets stage time. Our hiring partners run on-the-spot internship screens for standout builders.",
  },
  {
    n: 6,
    title: "Decode X Deloitte Data Hack",
    tagline: "Crack a real retail dataset. Present like a consultant.",
    category: "hackathon",
    orgN: 10, startDays: -18, startHour: 10, durationHrs: 8, deadlineDaysBefore: 1,
    venue: "Seminar Hall, SRCC", mode: "in_person",
    capacity: 120, fee: 199, prize: "₹30,000", teamMin: 3, teamMax: 3,
    tags: ["data", "case-study", "analytics"],
    description:
      "SRCC's flagship analytics case hackathon, now in its fourth edition. Teams receive an anonymised retail dataset on the morning of the event and eight hours to find the story, build the model, and pitch the board.\nJudged half on rigour, half on narrative — both matter.",
  },
  {
    n: 7,
    title: "Nrityanjali '26 — Inter-College Classical Dance Fest",
    tagline: "Eight forms. One stage. A night of goosebumps.",
    category: "cultural",
    orgN: 9, startDays: 26, startHour: 17, durationHrs: 5, deadlineDaysBefore: 3,
    venue: "Open Air Theatre, PSG Tech", mode: "in_person",
    capacity: 500, fee: 150, teamMin: 1, teamMax: 12,
    tags: ["bharatanatyam", "kathak", "classical", "dance"], featured: true,
    description:
      "Coimbatore's oldest inter-collegiate classical dance competition returns. Solo and group categories across eight classical forms, judged by a panel of national awardees.\nEven if you're not competing, the finale — a 40-member collaborative piece — is the kind of thing you tell people about years later.",
  },
  {
    n: 8,
    title: "Riff Riot: Battle of the Bands",
    tagline: "Bring the loud. Leave with the trophy.",
    category: "cultural",
    orgN: 3, startDays: 17, startHour: 18, durationHrs: 4, deadlineDaysBefore: 2,
    venue: "SR Grounds, IIT Delhi", mode: "in_person",
    capacity: 700, fee: 199, prize: "₹50,000 + studio session", teamMin: 3, teamMax: 8,
    tags: ["music", "bands", "rock"],
    description:
      "Eight colleges, one stage, forty minutes per set. Covers allowed in round one; original compositions score double in the finals.\nCrowd noise is tracked live and counts for 20% of the final score — so bring your loudest supporters.",
  },
  {
    n: 9,
    title: "Marquee: The Theatre Circuit",
    tagline: "Street plays under the clock tower.",
    category: "cultural",
    orgN: 4, startDays: 40, startHour: 16, durationHrs: 6, deadlineDaysBefore: 3,
    venue: "Central Quadrangle, Christ University", mode: "in_person",
    capacity: 400, fee: 100, teamMin: 5, teamMax: 15,
    tags: ["theatre", "nukkad", "drama"],
    description:
      "A day of street theatre and proscenium shorts judged by working actors from the Bengaluru stage circuit. Themes are announced a week ahead; scripts must be original.\nWinning troupe headlines the Christ University annual cultural evening.",
  },
  {
    n: 10,
    title: "Raas — Dandiya & Garba Night",
    tagline: "One circle. Ten thousand sticks. No experience needed.",
    category: "cultural",
    orgN: 5, startDays: 55, startHour: 19, durationHrs: 4, deadlineDaysBefore: 1,
    venue: "Convention Centre Arena, VIT", mode: "in_person",
    capacity: 2000, fee: 249, teamMin: 1, teamMax: 1,
    tags: ["garba", "dandiya", "night", "dance"],
    description:
      "VIT turns its arena into a giant garba circle with a live folk fusion band flying in from Ahmedabad. Free dandiya sticks at the gate while stocks last (they never last).\nBeginner circle runs all night on the left flank — nobody sits out at Raas.",
  },
  {
    n: 11,
    title: "Mic Drop: Inter-College Stand-up Night",
    tagline: "Five minutes. Your funniest life. One mic.",
    category: "cultural",
    orgN: 5, startDays: 12, startHour: 19, durationHrs: 3, deadlineDaysBefore: 2,
    venue: "Student Activity Centre, Manipal", mode: "in_person",
    capacity: 250, fee: 80, prize: "₹10,000 + comedy club spot", teamMin: 1, teamMax: 1,
    tags: ["standup", "comedy", "open-mic"],
    description:
      "Manipal's legendary open mic goes inter-collegiate. Five-minute sets, a ruthless emoji scoreboard, and a headliner set from a touring comic to close the night.\nMaterial must be original. Jokes about mess food are statistically overrepresented but always welcome.",
  },
  {
    n: 12,
    title: "Haute Couture: The Fashion Walk",
    tagline: "Designers, models, and one very long ramp.",
    category: "cultural",
    orgN: 3, startDays: -25, startHour: 18, durationHrs: 4, deadlineDaysBefore: 2,
    venue: "Dogwood Lawns, IIT Delhi", mode: "in_person",
    capacity: 600, fee: 250, teamMin: 6, teamMax: 20,
    tags: ["fashion", "design", "ramp-walk"],
    description:
      "The couture showdown of Rendezvous season. Teams bring a full themed line with choreography and sound design; collections are judged by working designers from two Indian fashion houses.\nLast year's sets involved projection mapping and a full brass section. The bar is, politely, absurd.",
  },
  {
    n: 13,
    title: "Inter-College Football Cup '26",
    tagline: "Sixteen colleges. One trophy. Full sends only.",
    category: "sports",
    orgN: 5, startDays: 30, startHour: 7, durationHrs: 10, deadlineDaysBefore: 5,
    venue: "MIT Football Grounds, Manipal", mode: "in_person",
    capacity: 32, fee: 1200, prize: "₹45,000 + the rolling trophy", teamMin: 12, teamMax: 18,
    tags: ["football", "tournament", "inter-college"], featured: true,
    description:
      "The KMC-Manipal rolling trophy opens to the network: sixteen knockout slots, two days, FIFA-refereed. Squads of 12–18, rolling subs, 2×25 minute halves.\nSlots fill by registration order — the waitlist from last year had nine teams on it.",
  },
  {
    n: 14,
    title: "Campus T20 Premier League",
    tagline: "Tape ball? No. Leather ball, white flannels optional.",
    category: "sports",
    orgN: 6, startDays: 22, startHour: 8, durationHrs: 12, deadlineDaysBefore: 4,
    venue: "NITT Stadium, NIT Trichy", mode: "in_person",
    capacity: 24, fee: 1500, prize: "₹30,000 + gear grants", teamMin: 11, teamMax: 15,
    tags: ["cricket", "t20", "league"],
    description:
      "Twenty-four college squads franchise-style through a draft, then straight T20 league action across a weekend. Live scoring, a proper scorer's tent, and a DJ who thinks he's at Chepauk.\nEvery match gets a highlights reel — campus innings worth remembering.",
  },
  {
    n: 15,
    title: "Sunrise 10K — Inter-College Marathon",
    tagline: "Run the beach loop before the sun finishes rising.",
    category: "sports",
    orgN: 7, startDays: 38, startHour: 5, durationHrs: 4, deadlineDaysBefore: 2,
    venue: "Kadalekai Beach Road, Goa", mode: "in_person",
    capacity: 500, fee: 350, tags: ["marathon", "10k", "running"],
    description:
      "BITS Goa's beach-loop 10K and 5K categories, chip-timed with hydration every 1.5K. Breakfast, finisher tees and a medal that actually looks good are included.\nInter-college team championship: your college's three fastest finishers combine for the trophy.",
  },
  {
    n: 16,
    title: "Smash Bros — Inter-College Badminton Open",
    tagline: "Singles, doubles, and mixed. Shuttle politics welcome.",
    category: "sports",
    orgN: 8, startDays: 16, startHour: 9, durationHrs: 8, deadlineDaysBefore: 3,
    venue: "New Indoor Stadium, RVCE", mode: "in_person",
    capacity: 128, fee: 200, prize: "₹15,000", teamMin: 1, teamMax: 2,
    tags: ["badminton", "open", "singles", "doubles"],
    description:
      "A one-day feather-shuttle open across six courts. Categories: men's singles, women's singles, doubles, mixed.\nCollege vs college bonus points accumulate across categories toward an overall champion's shield.",
  },
  {
    n: 17,
    title: "64 Squares — Rapid Chess Arena",
    tagline: "15+10. Clocks ticking. Whispers banned.",
    category: "sports",
    orgN: 2, startDays: 28, startHour: 10, durationHrs: 6, deadlineDaysBefore: 3,
    venue: "Chess Room, SAC, VIT", mode: "hybrid",
    capacity: 200, fee: 150, prize: "₹12,000", teamMin: 1, teamMax: 1,
    tags: ["chess", "rapid", "arena"], onlineLink: "https://lichess.org",
    description:
      "Nine-round Swiss rapid (15+10) with on-campus boards at VIT and a rated satellite lobby online for remote campuses. Strong field every year — FIDE-rated players from four colleges confirmed already.\nRegistration fee covers board fees and lunch for on-campus players.",
  },
  {
    n: 18,
    title: "Frostbite: Inter-College Ice… Wait, Kabaddi League",
    tagline: "Riders on the mat. Raids on repeat.",
    category: "sports",
    orgN: 6, startDays: -12, startHour: 16, durationHrs: 5, deadlineDaysBefore: 3,
    venue: "Recreation Hall, NIT Trichy", mode: "in_person",
    capacity: 16, fee: 800, prize: "₹25,000", teamMin: 7, teamMax: 12,
    tags: ["kabaddi", "league", "team"],
    description:
      "South-zone inter-college kabaddi, league + semis + final in one evening under the lights. Pro Kabaddi-style rules, two halves of 20.\nLoudest college supporters' block takes home the 'Twelfth Man' banner.",
  },
  {
    n: 19,
    title: "Figma Sprint: Design Systems in a Day",
    tagline: "Ship a real component library before dinner.",
    category: "workshop",
    orgN: 4, startDays: 10, startHour: 10, durationHrs: 6, deadlineDaysBefore: 1,
    venue: "Design Lab, Central Block, Christ", mode: "in_person",
    capacity: 60, fee: 399, tags: ["figma", "design-systems", "ui", "ux"],
    description:
      "A hands-on, bring-a-laptop workshop run by two product designers from a Bengaluru fintech. Tokens, variants, auto-layout mastery, and a team challenge where you build and present a mini design system.\nBeginners absolutely welcome — morning session assumes zero Figma experience.",
  },
  {
    n: 20,
    title: "Build-a-Drone: Hands-on Aero Workshop",
    tagline: "You leave with a quad that actually flies.",
    category: "workshop",
    orgN: 1, startDays: 44, startHour: 9, durationHrs: 16, deadlineDaysBefore: 5,
    venue: "Aero Shed, IIT Bombay", mode: "in_person",
    capacity: 40, fee: 1499, teamMin: 2, teamMax: 2,
    tags: ["drones", "aero", "hardware", "build"], featured: true,
    description:
      "Two full days at the IITB Aero Shed. Frames, ESCs, flight controllers, soldering, tuning, and a supervised first flight over the lake lawns.\nKits are included in the fee — you take the drone home. Only 40 seats; they vanish every year.",
  },
  {
    n: 21,
    title: "Money 101: The Student Finance Bootcamp",
    tagline: "Stipends, SIPs, and not going broke in semester 3.",
    category: "workshop",
    orgN: 10, startDays: 19, startHour: 11, durationHrs: 3, deadlineDaysBefore: 2,
    venue: "LT-2, SRCC", mode: "online",
    capacity: 400, fee: 0, tags: ["finance", "investing", "careers"],
    description:
      "Xavier's Finance Society and a SEBI-registered advisor break down budgeting on a stipend, starting SIPs, filing your first ITR, and spotting investment scams that target students.\nLive Q&A at the end — ask the questions you were embarrassed to ask elsewhere.",
  },
  {
    n: 22,
    title: "Pottery & Print: Slow-Makers Saturday",
    tagline: "Hands in clay. Linocut ink. Phones in lockers.",
    category: "workshop",
    orgN: 9, startDays: 6, startHour: 10, durationHrs: 4, deadlineDaysBefore: 1,
    venue: "Fine Arts Studio, PSG Tech", mode: "in_person",
    capacity: 30, fee: 599, tags: ["pottery", "linocut", "art", "slow-living"],
    description:
      "A quiet Saturday session: ninety minutes of wheel pottery, a break for filter coffee, then a linocut printing sprint. All materials, firing and postage of your fired piece included.\nPSG's Fine Arts Club caps it at 30 so the wheels never feel crowded.",
  },
  {
    n: 23,
    title: "Write It Till You Make It: Content & Comedy Writing",
    tagline: "From blank page to tight five.",
    category: "workshop",
    orgN: 5, startDays: 41, startHour: 14, durationHrs: 3, deadlineDaysBefore: 2,
    venue: "NLH 104, Manipal", mode: "in_person",
    capacity: 80, fee: 199, tags: ["writing", "comedy", "content"],
    description:
      "A touring screenwriter and a stand-up comic take you from premise to punchline: structure, beats, editing your own voice. Participants leave with a 5-minute piece and a slot at a future open mic.\nBring something you wrote this week — it gets workshopped live.",
  },
  {
    n: 24,
    title: "AI in India: The Next 500 Million Users",
    tagline: "A talk on building for Bharat at scale.",
    category: "tech_talk",
    orgN: 8, startDays: 8, startHour: 17, durationHrs: 2, deadlineDaysBefore: 1,
    venue: "IEM Auditorium, RVCE", mode: "hybrid",
    capacity: 400, fee: 0, onlineLink: "https://meet.google.com/rvce-ai-talk",
    tags: ["ai", "keynote", "india", "llm"], featured: true,
    description:
      "A principal AI researcher walks through what it actually takes to build LLM products for India's languages: data, dialects, cost curves and the 500M-user design problem nobody has solved yet.\nFollowed by an open floor — bring your sharpest questions.",
  },
  {
    n: 25,
    title: "Quantum Evening: Qubits for the Curious",
    tagline: "Zero prerequisites. Maximum wonder.",
    category: "tech_talk",
    orgN: 6, startDays: 24, startHour: 18, durationHrs: 2, deadlineDaysBefore: 1,
    venue: "Binod Chaudhary Hall, NITT", mode: "online",
    capacity: 600, fee: 0, onlineLink: "https://meet.google.com/nitt-quantum",
    tags: ["quantum", "physics", "talk"],
    description:
      "A friendly, no-math-first introduction to quantum computing — what a qubit is, why error correction is eating the field, and what internships in quantum labs actually look like.\nCloses with a live demo on a real cloud quantum computer.",
  },
  {
    n: 26,
    title: "Founders at 22: Campus Startup Panel",
    tagline: "Three student founders. Real numbers. No hustle-bro filters.",
    category: "tech_talk",
    orgN: 10, startDays: 15, startHour: 16, durationHrs: 3, deadlineDaysBefore: 1,
    venue: "Auditorium, SRCC", mode: "in_person",
    capacity: 300, fee: 0, tags: ["startups", "founders", "e-cell"],
    description:
      "Three founders who started in hostel rooms — one funded, one bootstrapped, one shut down — talk through what the first two years actually looked like: revenue, rejections, exams and all.\nNetworking over samosas after the panel. Bring your questions, leave your pitches for the open floor.",
  },
  {
    n: 27,
    title: "Ship It: Open Source Keynote + Hack-to-PR",
    tagline: "Leave the room with a merged PR.",
    category: "tech_talk",
    orgN: 2, startDays: 33, startHour: 15, durationHrs: 5, deadlineDaysBefore: 2,
    venue: "Devfolio Lounge, VIT", mode: "hybrid",
    capacity: 150, fee: 0, onlineLink: "https://meet.google.com/vit-oss",
    tags: ["open-source", "github", "beginner"],
    description:
      "Maintainers of three popular Indian FOSS projects explain how contribution really works, then stay online while everyone in the room attempts a real first PR with mentorship.\nSpecial shout-out wall for anyone who merges live.",
  },
  {
    n: 28,
    title: "Cloud-Native Saturday: K8s Without Tears",
    tagline: "Containers, clusters, and why your pod keeps dying.",
    category: "tech_talk",
    orgN: 8, startDays: -8, startHour: 11, durationHrs: 4, deadlineDaysBefore: 1,
    venue: "Virtual + CSE Seminar Hall, RVCE", mode: "online",
    capacity: 500, fee: 0, onlineLink: "https://meet.google.com/rvce-k8s",
    tags: ["kubernetes", "devops", "cloud"],
    description:
      "A senior SRE walks through a production incident timeline, then rebuilds a broken cluster live while you follow along on free cloud credits shared in the session.\nThe debugging checklist from this talk gets passed around campus like exam notes.",
  },
  {
    n: 29,
    title: "Kaleido '26 — Xavier's Grand Fest Weekend",
    tagline: "Three days. Five stages. The whole city shows up.",
    category: "fest",
    orgN: 3, startDays: 60, startHour: 10, durationHrs: 60, deadlineDaysBefore: 7,
    venue: "St. Xavier's Campus, Fort, Mumbai", mode: "in_person",
    capacity: 5000, fee: 499, teamMin: 1, teamMax: 1,
    tags: ["fest", "music", "art", "food"], featured: true,
    description:
      "The mother of all Mumbai college fests returns: five stages, forty events, a massive gaming arena, a food street that requires a strategy document, and two pro-show nights headlined by national acts.\nNetwork passes include all daytime events; pro-show nights are separately ticketed at the gate.",
  },
  {
    n: 30,
    title: "Dune: BITS Goa's Beachside Fest",
    tagline: "Sand between your toes, bass in your chest.",
    category: "fest",
    orgN: 7, startDays: 52, startHour: 17, durationHrs: 55, deadlineDaysBefore: 5,
    venue: "Campus + Z-Beach Stages, BITS Goa", mode: "in_person",
    capacity: 3000, fee: 799, teamMin: 1, teamMax: 1,
    tags: ["beach", "fest", "edm", "cultural"], featured: true,
    description:
      "Three nights on the BITS Goa beach: EDM sunset sets, indie sundowner stage, silent disco past midnight, and a sunrise drum circle on the last day.\nOn-campus stay is bundled for outstation colleges — pick your squad early, the dorm blocks fill in hours.",
  },
  {
    n: 31,
    title: "Spring Spree '26",
    tagline: "The old stone campus goes electric for 72 hours.",
    category: "fest",
    orgN: 6, startDays: 75, startHour: 9, durationHrs: 72, deadlineDaysBefore: 8,
    venue: "NIT Trichy Full Campus", mode: "in_person",
    capacity: 6000, fee: 299, teamMin: 1, teamMax: 1,
    tags: ["fest", "proshow", "workshops", "games"],
    description:
      "NITT's legendary three-day cultural carnival: ten competitive clusters from stand-up to JAM to eastern vocals, food streets run by every campus club, and a pro-show night that people book trains for.\nEarly-bird stays available in the campus guest houses.",
  },
  {
    n: 32,
    title: "Neon Run + Afterparty",
    tagline: "5K in glow paint. Night in neon.",
    category: "fest",
    orgN: 5, startDays: 20, startHour: 19, durationHrs: 5, deadlineDaysBefore: 2,
    venue: "KC Point, Manipal", mode: "in_person",
    capacity: 900, fee: 450, tags: ["run", "neon", "party", "night"],
    description:
      "A UV-lit 5K fun run through campus — glow paint stations every kilometre — finishing directly at the neon afterparty stage.\nWhite tees strongly encouraged. Timing chips are for the race; nobody is racing.",
  },
  {
    n: 33,
    title: "Millet & Malt: Campus Food & Flea Fest",
    tagline: "Fifty stalls. Student chefs. Thrift and vinyl.",
    category: "fest",
    orgN: 9, startDays: 13, startHour: 11, durationHrs: 9, deadlineDaysBefore: 1,
    venue: "Main Stadium Lawns, PSG Tech", mode: "in_person",
    capacity: 1500, fee: 50, tags: ["food", "flea", "thrift", "music"],
    description:
      "A daytime eating-and-shopping festival: student-run food stalls (millet burgers, filter-coffee soft serves), a thrift-and-vinyl flea, and unplugged sets all day on the grass stage.\nStall applications close a week before the fest — student vendors get power and tables free.",
  },
  {
    n: 34,
    title: "Aero Show + Stargazing Night",
    tagline: "RC planes by day, Saturn's rings by night.",
    category: "fest",
    orgN: 1, startDays: -5, startHour: 15, durationHrs: 9, deadlineDaysBefore: 2,
    venue: "Gymkhana Grounds + Rooftop, IITB", mode: "in_person",
    capacity: 800, fee: 99, tags: ["aero", "astronomy", "stargazing"],
    description:
      "The Aero Club's annual demo day: RC formation flights, jet-engine startups that rattle the bleachers, and a DJI night drone ballet at dusk.\nAfter dark, the Astronomy Club wheels out the big scopes for Jupiter, Saturn and a moon so close it feels unreasonable.",
  },
  {
    n: 35,
    title: "Esports Colosseum: Valorant + FIFA",
    tagline: "Main stage. Casters. Your college on the banner.",
    category: "hackathon",
    orgN: 5, startDays: 11, startHour: 10, durationHrs: 12, deadlineDaysBefore: 2,
    venue: "Gaming Lab, MIT Manipal", mode: "hybrid",
    capacity: 256, fee: 250, prize: "₹35,000 split pool", teamMin: 5, teamMax: 6,
    tags: ["esports", "valorant", "fifa", "gaming"], onlineLink: "https://discord.gg/esports",
    description:
      "Two brackets, one venue, full production: Valorant 5v5 (on-stage semis and finals with casters) and a FIFA singles ladder running alongside.\nRemote colleges can play the Valorant bracket online through quarterfinals; LAN attendance required for semis onward.",
  },
  {
    n: 36,
    title: "The Idea Bazaar (Draft — details cooking)",
    tagline: "Coming soon: a maker-market pitch fest.",
    category: "fest",
    orgN: 1, startDays: 90, startHour: 10, durationHrs: 8, deadlineDaysBefore: 5,
    venue: "TBA, IIT Bombay", mode: "in_person",
    capacity: 300, fee: 0, tags: ["makers", "pitch", "bazaar"],
    status: "draft",
    description:
      "Still being finalised with the maker clubs — a market-style fest where student makers sell, pitch and take pre-orders.\nWatch this space; publishing once venues lock.",
  },
  {
    n: 45,
    title: "Winter Literature Circle (Postponed)",
    tagline: "Rearranging around exam season — back in spring.",
    category: "cultural",
    orgN: 10, startDays: 48, startHour: 16, durationHrs: 3, deadlineDaysBefore: 2,
    venue: "Reading Room, SRCC", mode: "in_person",
    capacity: 60, fee: 0, tags: ["literature", "poetry", "reading"],
    status: "cancelled",
    description:
      "Postponed due to a clash with university practicals. The lit-circle returns with a spring edition — original slot registrations will be honoured.\nJoin the SRCC societies list for the re-announcement.",
  },
];

export async function seedIfEmpty() {
  try {
    const [row] = await db.select({ n: count() }).from(colleges);
    if ((row?.n ?? 0) > 0) return { seeded: false as const };
    return await seed();
  } catch (err) {
    console.error("[seed] failed:", err);
    return { seeded: false as const, error: "seed-failed" };
  }
}

export async function seed() {
  const passwordHash = seedHashPassword("password123");
  const rng = mulberry32(42);

  // ---- colleges
  await db
    .insert(colleges)
    .values(
      COLLEGES.map((c) => ({
        id: uid("c011", c.n),
        name: c.name,
        shortName: c.short,
        city: c.city,
        state: c.state,
        website: c.website,
        hue: c.hue,
      }))
    )
    .onConflictDoNothing();

  // ---- users
  const allUsers = [...ORGANIZERS, ...STUDENTS];
  await db
    .insert(users)
    .values(
      allUsers.map((u) => ({
        id: uid("a111", u.n),
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        collegeId: uid("c011", u.collegeN),
        bio: u.bio ?? null,
        hue: u.hue,
      }))
    )
    .onConflictDoNothing();

  // ---- events
  const organizerByN = new Map(ORGANIZERS.map((o) => [o.n, o]));
  const eventRows = EVENTS.map((e) => {
    const org = organizerByN.get(e.orgN)!;
    const startsAt = at(e.startDays, e.startHour);
    const endsAt = new Date(startsAt.getTime() + e.durationHrs * hour);
    const deadlineHour = Math.max(startsAt.getHours() - 1, 1);
    const registrationDeadline = at(e.startDays - e.deadlineDaysBefore, deadlineHour);
    return {
      id: uid("e111", e.n),
      title: e.title,
      tagline: e.tagline,
      description: e.description,
      category: e.category,
      mode: e.mode,
      venue: e.venue,
      city: COLLEGES.find((c) => c.n === org.collegeN)!.city,
      onlineLink: e.onlineLink ?? null,
      startsAt,
      endsAt,
      registrationDeadline,
      capacity: e.capacity,
      feeInr: e.fee,
      prizePool: e.prize ?? null,
      teamSizeMin: e.teamMin ?? 1,
      teamSizeMax: e.teamMax ?? 1,
      tags: e.tags,
      status: e.status ?? "published",
      featured: e.featured ? 1 : 0,
      hue: hueForCategory(e.category) + Math.floor(rng() * 24) - 12,
      hostCollegeId: uid("c011", org.collegeN),
      organizerId: uid("a111", org.n),
      createdAt: new Date(startsAt.getTime() - (20 + Math.floor(rng() * 25)) * day),
    };
  });
  await db.insert(events).values(eventRows).onConflictDoNothing();

  // ---- registrations (students + a couple of curious organizers, never the host)
  const regs: { id: string; eventId: string; userId: string; createdAt: Date }[] = [];
  let regN = 1;
  for (const e of EVENTS) {
    if (e.status === "draft" || e.status === "cancelled") continue;
    const org = organizerByN.get(e.orgN)!;
    const pool = allUsers.filter((u) => u.n !== org.n);
    const shuffled = [...pool].sort(() => rng() - 0.5);
    const target = Math.min(
      Math.max(3, Math.floor(rng() * 10) + 4),
      shuffled.length
    );
    for (let i = 0; i < target; i++) {
      regs.push({
        id: uid("b011", regN++),
        eventId: uid("e111", e.n),
        userId: uid("a111", shuffled[i].n),
        createdAt: new Date(
          Date.now() - Math.floor(rng() * 9) * day - Math.floor(rng() * 20) * hour
        ),
      });
    }
  }
  await db.insert(registrations).values(regs).onConflictDoNothing();

  return { seeded: true as const, counts: { colleges: COLLEGES.length, users: allUsers.length, events: EVENTS.length, registrations: regs.length } };
}

function hueForCategory(category: string) {
  switch (category) {
    case "hackathon": return 258;
    case "cultural": return 330;
    case "sports": return 152;
    case "workshop": return 32;
    case "tech_talk": return 206;
    case "fest": return 14;
    default: return 260;
  }
}
