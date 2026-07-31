import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";
import Footer from "../components/Footer";
import {
  Heart,
  Flag,
  UserCheck,
  TrendingUp,
  Calendar,
  LayoutDashboard,
  CalendarDays,
  Mail,
  Clock,
  Award,
  Coins,
  Eye,
  Target,
  Activity,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Users,
  BarChart3,
  Play,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RoleTab = "owner" | "jockey" | "spectator";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FlowStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ─── Feature Data ────────────────────────────────────────────────────────────

const ownerFeatures: Feature[] = [
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Horse Registry",
    description:
      "Register, edit, and manage your horses with detailed profiles and health tracking.",
  },
  {
    icon: <Flag className="h-5 w-5" />,
    title: "Tournament Entry",
    description:
      "Enter your horses into tournaments and races in just a few clicks.",
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "Jockey Management",
    description:
      "Browse available jockeys, review stats, and send race invitations.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Performance Tracking",
    description:
      "Comprehensive race results, statistics, and horse status indicators.",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Schedule Overview",
    description:
      "See all upcoming races and entry deadlines on a unified calendar.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Full Dashboard",
    description:
      "A centralized command center for all your horse management needs.",
  },
];

const jockeyFeatures: Feature[] = [
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: "Race Schedule",
    description:
      "View all your upcoming races in a clean, organized calendar view.",
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Invitations",
    description:
      "Receive, accept, or decline race invitations from horse owners.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Race History",
    description: "Review past performances, results, and detailed race data.",
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: "Performance Stats",
    description:
      "Dashboard with rankings, achievements, and key racing analytics.",
  },
  {
    icon: <Coins className="h-5 w-5" />,
    title: "Commission Tracking",
    description: "Track your earnings, fees, and financial summaries.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Profile Customization",
    description:
      "Update your bio, weight, fee, and stats to present to stable owners.",
  },
];

const spectatorFeatures: Feature[] = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Browse Races",
    description:
      "Explore upcoming, ongoing, and completed races with full details.",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Make Predictions",
    description:
      "Predict race outcomes using virtual points and compete with others.",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Live Telemetry",
    description:
      "Watch real-time race data including horse positions and speeds.",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: "Leaderboards",
    description:
      "Climb rankings and compare prediction accuracy with other spectators.",
  },
  {
    icon: <Flag className="h-5 w-5" />,
    title: "Race Results",
    description:
      "View completed race outcomes, statistics, and detailed results.",
  },
  {
    icon: <Play className="h-5 w-5" />,
    title: "Race Replays",
    description:
      "Replay completed races with full animated tracking to analyze previous outcomes.",
  },
];

const ROLE_DATA: Record<
  RoleTab,
  {
    label: string;
    icon: React.ReactNode;
    features: Feature[];
    color: string;
    tagline: string;
  }
> = {
  owner: {
    label: "Horse Owner",
    icon: <Trophy className="h-5 w-5" />,
    features: ownerFeatures,
    color: "#064E3B",
    tagline: "Manage your stable. Win championships.",
  },
  jockey: {
    label: "Jockey",
    icon: <Award className="h-5 w-5" />,
    features: jockeyFeatures,
    color: "#0E7C61",
    tagline: "Race smarter. Rise through the ranks.",
  },
  spectator: {
    label: "Spectator",
    icon: <Eye className="h-5 w-5" />,
    features: spectatorFeatures,
    color: "#1A6B4C",
    tagline: "Predict. Compete. Celebrate.",
  },
};

const FLOW_DATA: Record<RoleTab, FlowStep[]> = {
  owner: [
    {
      number: 1,
      title: "Create Stable Profile",
      description:
        "Sign up and set up your stable settings to initialize your profile.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: 2,
      title: "Register Thoroughbreds",
      description:
        "Add horses to your digital stable registry with their basic metrics.",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      number: 3,
      title: "Enter Tournaments",
      description:
        "Browse upcoming scheduled events and enroll your horse entries.",
      icon: <Flag className="h-6 w-6" />,
    },
  ],
  jockey: [
    {
      number: 1,
      title: "Register Jockey Profile",
      description:
        "Sign up and configure jockey preferences to list in the registry.",
      icon: <UserCheck className="h-6 w-6" />,
    },
    {
      number: 2,
      title: "Accept Race Invitations",
      description:
        "Browse and accept contract ride offers sent by horse owners.",
      icon: <Mail className="h-6 w-6" />,
    },
    {
      number: 3,
      title: "Take Part in Races",
      description:
        "Participate in simulated races and check your performance data.",
      icon: <Trophy className="h-6 w-6" />,
    },
  ],
  spectator: [
    {
      number: 1,
      title: "Get Spectator Pass",
      description:
        "Create a free account to access the simulation predictions dashboard.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: 2,
      title: "Submit Predictions",
      description:
        "Submit points predictions on upcoming races before gates open.",
      icon: <Target className="h-6 w-6" />,
    },
    {
      number: 3,
      title: "Stream Live Races",
      description:
        "Watch the simulated 2D running races with live telemetry gauges.",
      icon: <Play className="h-6 w-6" />,
    },
  ],
};

// ─── Highlight Card (Core Modules Info) ──────────────────────────────────────

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-highlight-card group relative overflow-hidden rounded-2xl border border-[#064E3B]/10 bg-white/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#064E3B]/25 hover:shadow-lg dark:bg-slate-800/50 dark:border-white/10">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#064E3B]/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl bg-[#064E3B]/10 p-2.5 text-[#064E3B] dark:bg-emerald-400/10 dark:text-emerald-400">
          {icon}
        </div>
        <h4
          className="text-base font-bold text-[#064E3B] dark:text-white"
          style={{ margin: "8px 0 0 0" }}
        >
          {title}
        </h4>
        <p
          className="text-sm leading-relaxed text-slate-500 dark:text-slate-400"
          style={{ margin: "8px 0 0 0" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div
      className="landing-feature-card group relative overflow-hidden rounded-xl border border-[#064E3B]/8 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#064E3B]/20 hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-800/40 dark:border-white/8"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0 rounded-lg bg-gradient-to-br from-[#064E3B]/15 to-[#064E3B]/5 p-2.5 text-[#064E3B] transition-colors group-hover:from-[#064E3B] group-hover:to-[#0E7C61] group-hover:text-white dark:text-emerald-400">
          {feature.icon}
        </span>
        <div>
          <h4
            className="text-sm font-bold text-[#064E3B] dark:text-white"
            style={{ margin: 0 }}
          >
            {feature.title}
          </h4>
          <p
            className="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
            style={{ margin: "4px 0 0 0" }}
          >
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works Step ───────────────────────────────────────────────────────

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="landing-step-card group relative flex flex-col items-center text-center">
      {/* Connector line */}
      {number < 3 && (
        <div className="absolute left-[calc(50%+40px)] top-8 hidden h-0.5 w-[calc(100%-80px)] bg-gradient-to-r from-[#064E3B]/20 to-[#064E3B]/5 lg:block" />
      )}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#0E7C61] text-white shadow-lg shadow-[#064E3B]/20 transition-transform duration-300 group-hover:scale-110">
        {icon}
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EAB308] text-xs font-black text-[#064E3B]">
          {number}
        </span>
      </div>
      <h4
        className="text-base font-bold text-[#064E3B] dark:text-white"
        style={{ margin: "8px 0 0 0" }}
      >
        {title}
      </h4>
      <p
        className="max-w-[200px] text-sm text-slate-500 dark:text-slate-400"
        style={{ textAlign: "center", margin: "8px auto 0 auto" }}
      >
        {description}
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function MainPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<RoleTab>("owner");
  const [flowRole, setFlowRole] = useState<RoleTab>("owner");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const currentRole = ROLE_DATA[activeRole];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ── Glassmorphic Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#064E3B]/8 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 dark:border-white/8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#064E3B] to-[#0E7C61] shadow-md shadow-[#064E3B]/20">
              <Trophy className="h-4.5 w-4.5 text-[#EAB308]" />
            </div>
            <span className="font-headline text-lg font-black text-[#064E3B] dark:text-white">
              Elite Turf
            </span>
          </button>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="rounded-xl border-[#064E3B]/20 text-[#064E3B] hover:bg-[#064E3B]/5 dark:border-white/15 dark:text-white"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="rounded-xl bg-gradient-to-r from-[#064E3B] to-[#0E7C61] text-white shadow-md shadow-[#064E3B]/25 transition-shadow hover:shadow-lg hover:shadow-[#064E3B]/30"
            >
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f4f6f5] via-white to-[#f4f6f5] dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#064E3B 1px, transparent 1px), linear-gradient(90deg, #064E3B 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Content */}
          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="landing-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-[#EAB308]/30 bg-[#EAB308]/10 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#EAB308]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#EAB308] dark:text-[#EAB308]">
                  Horse Racing Management Platform
                </span>
              </div>

              {/* Headline */}
              <h1
                className="landing-fade-in max-w-4xl font-headline text-5xl font-black leading-[1.1] text-[#064E3B] md:text-6xl lg:text-7xl dark:text-white"
                style={{ animationDelay: "100ms" }}
              >
                Where Champions Are{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#064E3B] via-[#0E7C61] to-[#EAB308] bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-[#EAB308]">
                    Made
                  </span>
                  <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#EAB308]/20 rounded-sm" />
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="landing-fade-in mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300"
                style={{ animationDelay: "200ms" }}
              >
                A centralized platform connecting horse owners, jockeys, and
                spectators — from tournament management and race scheduling to
                live telemetry, predictions, and real-time race simulation.
              </p>

              {/* CTA Buttons */}
              <div
                className="landing-fade-in mt-10 flex flex-wrap items-center justify-center gap-4"
                style={{ animationDelay: "300ms" }}
              >
                <Button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="h-12 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#0E7C61] px-8 text-base font-bold text-white shadow-xl shadow-[#064E3B]/25 transition-all hover:shadow-2xl hover:shadow-[#064E3B]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Free Account
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.RACES)}
                  className="h-12 rounded-xl border-[#064E3B]/20 px-8 text-base font-bold text-[#064E3B] hover:bg-[#064E3B]/5 dark:border-white/15 dark:text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Live Races
                </Button>
              </div>

              {/* Trust badges */}
              <div
                className="landing-fade-in mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400"
                style={{ animationDelay: "400ms" }}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#EAB308]" />
                  Real-time Simulation
                </span>
                <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#064E3B] dark:text-emerald-400" />
                  Multi-role Platform
                </span>
                <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-[#064E3B] dark:text-emerald-400" />
                  Advanced Analytics
                </span>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f6f5] to-transparent dark:from-slate-900" />
        </section>

        {/* ── Core Platform Highlights ───────────────────────────────────────── */}
        <section className="relative border-y border-[#064E3B]/8 bg-gradient-to-b from-[#f4f6f5] to-white py-16 dark:from-slate-900 dark:to-slate-800/50 dark:border-white/5">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <HighlightCard
                icon={<Trophy className="h-5 w-5" />}
                title="Tournaments & Events"
                description="Streamline racing schedules, configure track profiles, set race conditions, and enroll horse entries."
              />
              <HighlightCard
                icon={<Heart className="h-5 w-5" />}
                title="Stable & Horse Registry"
                description="Register and manage thoroughbred details, keep track of stable ownership relationships, and monitor active horse statuses."
              />
              <HighlightCard
                icon={<Target className="h-5 w-5" />}
                title="Live Simulation & Replays"
                description="Watch simulated 2D races powered by real-time coordinates, speed gauges, telemetry widgets, and full history replays."
              />
              <HighlightCard
                icon={<Coins className="h-5 w-5" />}
                title="Predictions & Rewards"
                description="Engage audiences with pre-race prediction casts, points-based scorebooks, fan leaderboards, and results auditing."
              />
            </div>
          </div>
        </section>

        {/* ── Interactive Role Showcase ─────────────────────────────────────── */}
        <section id="showcase" className="relative py-20 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            {/* Section header */}
            <div className="mb-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/10 bg-[#064E3B]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#064E3B] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                Built for Every Role
              </span>
              <h2 className="mt-4 font-headline text-3xl font-black text-[#064E3B] md:text-4xl dark:text-white">
                One Platform, Three Experiences
              </h2>
              <p
                className="mx-auto mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400"
                style={{ textAlign: "center", margin: "12px auto 0" }}
              >
                Whether you own a stable, ride competitively, or love making
                predictions — we've built the tools you need.
              </p>
            </div>

            {/* Role tabs */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-2xl border border-[#064E3B]/10 bg-white/80 p-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/80">
                {(Object.keys(ROLE_DATA) as RoleTab[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveRole(key)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300
                      ${
                        activeRole === key
                          ? "bg-gradient-to-r from-[#064E3B] to-[#0E7C61] text-white shadow-lg shadow-[#064E3B]/20"
                          : "text-slate-500 hover:text-[#064E3B] dark:text-slate-400 dark:hover:text-white"
                      }`}
                  >
                    {ROLE_DATA[key].icon}
                    <span className="hidden sm:inline">
                      {ROLE_DATA[key].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role content */}
            <div className="landing-role-transition">
              {/* Tagline */}
              <p
                key={`tagline-${activeRole}`}
                className="landing-slide-up mb-8 text-center text-base font-semibold text-[#064E3B] dark:text-emerald-400"
              >
                {currentRole.tagline}
              </p>

              {/* Feature grid */}
              <div
                key={`features-${activeRole}`}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {currentRole.features.map((feature, i) => (
                  <FeatureCard
                    key={feature.title}
                    feature={feature}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section className="relative border-t border-[#064E3B]/8 bg-gradient-to-b from-white to-[#f4f6f5] py-20 dark:from-slate-800/50 dark:to-slate-900 dark:border-white/5">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EAB308]/20 bg-[#EAB308]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#EAB308]">
                Getting Started
              </span>
              <h2 className="mt-4 font-headline text-3xl font-black text-[#064E3B] md:text-4xl dark:text-white">
                From Sign-Up to Race Day
              </h2>
              <p
                className="mx-auto mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400"
                style={{ textAlign: "center", margin: "12px auto 0" }}
              >
                Get set up and participating in minutes — no complicated
                onboarding.
              </p>
            </div>

            {/* Flow selector tabs */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-2xl border border-[#064E3B]/10 bg-white/80 p-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/80">
                {(Object.keys(ROLE_DATA) as RoleTab[]).map((key) => (
                  <button
                    key={`flow-tab-${key}`}
                    onClick={() => setFlowRole(key)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300
                      ${
                        flowRole === key
                          ? "bg-gradient-to-r from-[#064E3B] to-[#0E7C61] text-white shadow-lg shadow-[#064E3B]/20"
                          : "text-slate-500 hover:text-[#064E3B] dark:text-slate-400 dark:hover:text-white"
                      }`}
                  >
                    {ROLE_DATA[key].icon}
                    <span>{ROLE_DATA[key].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timelines container */}
            <div className="landing-role-transition">
              <div
                key={`flow-${flowRole}`}
                className="landing-slide-up grid grid-cols-1 gap-10 sm:grid-cols-3 lg:grid-cols-3"
              >
                {FLOW_DATA[flowRole].map((step) => (
                  <StepCard
                    key={step.title}
                    number={step.number}
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Enhanced CTA Banner ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 dark:bg-slate-900">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#085D47] to-[#0E7C61] p-10 md:p-16 shadow-2xl shadow-[#064E3B]/30">
              {/* Decorative elements */}
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#EAB308]/10 blur-2xl" />
              <div className="absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-[#EAB308]/10 blur-2xl" />
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#EAB308]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Join the Community
                </div>
                <h2
                  className="font-headline text-3xl font-black md:text-4xl"
                  style={{ color: "#ffffff" }}
                >
                  Ready to Enter the Arena?
                </h2>
                <p
                  className="mx-auto mt-4 max-w-xl text-base text-white/60"
                  style={{ textAlign: "center", margin: "16px auto 0" }}
                >
                  Join thousands of horse racing enthusiasts on the most
                  comprehensive management platform. Create your free account
                  and start competing today.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button
                    onClick={() => navigate(ROUTES.REGISTER)}
                    className="h-12 rounded-xl bg-[#EAB308] px-8 text-base font-bold text-[#064E3B] shadow-xl shadow-black/20 transition-all hover:bg-[#EAB308]/90 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(ROUTES.LOGIN)}
                    className="h-12 rounded-xl px-8 text-base font-bold text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    Already have an account? Log In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
