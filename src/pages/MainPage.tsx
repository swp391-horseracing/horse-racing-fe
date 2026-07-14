import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
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
} from "lucide-react";

type TabValue = "home" | "owner" | "jockey" | "spectator";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ownerFeatures: Feature[] = [
  {
    icon: <Heart className="h-5 w-5 text-[#064E3B]" />,
    title: "Horse Registry",
    description:
      "Register, edit, and manage your horses with detailed profiles and health tracking.",
  },
  {
    icon: <Flag className="h-5 w-5 text-[#064E3B]" />,
    title: "Tournament Entry",
    description:
      "Enter your horses into tournaments and races in just a few clicks.",
  },
  {
    icon: <UserCheck className="h-5 w-5 text-[#064E3B]" />,
    title: "Jockey Management",
    description:
      "Browse available jockeys, review stats, and send race invitations.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-[#064E3B]" />,
    title: "Performance Tracking",
    description:
      "Comprehensive race results, statistics, and horse status indicators.",
  },
  {
    icon: <Calendar className="h-5 w-5 text-[#064E3B]" />,
    title: "Schedule Overview",
    description:
      "See all upcoming races and entry deadlines on a unified calendar.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5 text-[#064E3B]" />,
    title: "Full Dashboard",
    description:
      "A centralized command center for all your horse management needs.",
  },
];

const jockeyFeatures: Feature[] = [
  {
    icon: <CalendarDays className="h-5 w-5 text-[#064E3B]" />,
    title: "Race Schedule",
    description:
      "View all your upcoming races in a clean, organized calendar view.",
  },
  {
    icon: <Mail className="h-5 w-5 text-[#064E3B]" />,
    title: "Invitations",
    description:
      "Receive, accept, or decline race invitations from horse owners.",
  },
  {
    icon: <Clock className="h-5 w-5 text-[#064E3B]" />,
    title: "Race History",
    description: "Review past performances, results, and detailed race data.",
  },
  {
    icon: <Award className="h-5 w-5 text-[#064E3B]" />,
    title: "Performance Stats",
    description:
      "Dashboard with rankings, achievements, and key racing analytics.",
  },
  {
    icon: <Coins className="h-5 w-5 text-[#064E3B]" />,
    title: "Commission Tracking",
    description: "Track your earnings, fees, and financial summaries.",
  },
];

const spectatorFeatures: Feature[] = [
  {
    icon: <Eye className="h-5 w-5 text-[#064E3B]" />,
    title: "Browse Races",
    description:
      "Explore upcoming, ongoing, and completed races with full details.",
  },
  {
    icon: <Target className="h-5 w-5 text-[#064E3B]" />,
    title: "Make Predictions",
    description:
      "Predict race outcomes using virtual points and compete with others.",
  },
  {
    icon: <Activity className="h-5 w-5 text-[#064E3B]" />,
    title: "Live Telemetry",
    description:
      "Watch real-time race data including horse positions and speeds.",
  },
  {
    icon: <Trophy className="h-5 w-5 text-[#064E3B]" />,
    title: "Leaderboards",
    description:
      "Climb rankings and compare prediction accuracy with other spectators.",
  },
  {
    icon: <Flag className="h-5 w-5 text-[#064E3B]" />,
    title: "Race Results",
    description:
      "View completed race outcomes, statistics, and detailed results.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="border border-[#064E3B]/10 transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#064E3B]/10 p-2">{feature.icon}</span>
          <CardTitle className="text-sm font-bold text-[#064E3B]">
            {feature.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function HomeContent({ onTabChange }: { onTabChange: (v: TabValue) => void }) {
  const navigate = useNavigate();

  const roleCards = [
    {
      key: "owner" as TabValue,
      icon: <Trophy className="h-8 w-8" />,
      title: "Horse Owner",
      description:
        "Manage your stable, register for tournaments, and track horse performance.",
    },
    {
      key: "jockey" as TabValue,
      icon: <Award className="h-8 w-8" />,
      title: "Jockey",
      description:
        "View race schedules, accept invitations, and climb the rankings.",
    },
    {
      key: "spectator" as TabValue,
      icon: <Eye className="h-8 w-8" />,
      title: "Spectator",
      description:
        "Follow races, make predictions, and compete on leaderboards.",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center p-8 gap-12">
      <div className="max-w-3xl space-y-4 pt-8">
        <div className="flex items-center justify-center gap-2 text-[#EAB308]">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Elite Turf Registry
          </span>
        </div>
        <h1 className="font-heading text-4xl font-black text-[#064E3B] md:text-5xl">
          The Complete Horse Racing
          <br />
          Management Platform
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-400">
          A centralized platform connecting horse owners, jockeys, and
          spectators — from tournament management and race scheduling to live
          telemetry and predictions.
        </p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {roleCards.map((card) => (
          <Card
            key={card.key}
            className="cursor-pointer border border-[#064E3B]/10 transition-all hover:border-[#064E3B]/30 hover:shadow-lg"
            onClick={() => onTabChange(card.key)}
          >
            <CardHeader>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="rounded-xl bg-[#064E3B]/10 p-3 text-[#064E3B]">
                  {card.icon}
                </span>
                <CardTitle className="text-lg font-bold text-[#064E3B]">
                  {card.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {card.description}
              </CardDescription>
            </CardContent>
            <div className="px-4 pb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange(card.key);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-[#064E3B] transition-colors hover:text-[#EAB308]"
              >
                Learn more <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="w-full max-w-2xl rounded-2xl bg-[#064E3B] p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-sm text-white/70">
          Sign in to access your personalized dashboard.
        </p>
        <Button
          className="mt-4 bg-[#EAB308] text-[#064E3B] hover:bg-[#EAB308]/90"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Sign In Now
        </Button>
      </div>
    </div>
  );
}

function FeatureGrid({
  title,
  features,
}: {
  title: string;
  features: Feature[];
}) {
  return (
    <div className="flex flex-col items-center p-8 gap-8">
      <div className="max-w-3xl space-y-3 text-center">
        <h1 className="font-heading text-3xl font-black text-[#064E3B]">
          {title}
        </h1>
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </div>
  );
}

function OwnerContent() {
  return (
    <FeatureGrid title="Built for Horse Owners" features={ownerFeatures} />
  );
}

function JockeyContent() {
  return <FeatureGrid title="Built for Jockeys" features={jockeyFeatures} />;
}

function SpectatorContent() {
  return (
    <FeatureGrid title="Built for Spectators" features={spectatorFeatures} />
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("home");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      html.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="grid grid-cols-3 items-center p-5 border-b w-full shrink-0 sticky top-0 z-10 bg-background/50 backdrop-blur">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("home")}
            className="text-xl font-bold"
          >
            Elite Turf Registry
          </Button>
        </div>

        <div className="flex justify-center">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList variant="line">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="owner">Horse Owner</TabsTrigger>
              <TabsTrigger value="jockey">Jockey</TabsTrigger>
              <TabsTrigger value="spectator">Spectator</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button onClick={toggleTheme} variant="ghost" size="icon">
            {isDarkMode ? "☀️" : "🌙"}
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.LOGIN)}>
            Login
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === "home" && <HomeContent onTabChange={setActiveTab} />}
        {activeTab === "owner" && <OwnerContent />}
        {activeTab === "jockey" && <JockeyContent />}
        {activeTab === "spectator" && <SpectatorContent />}
      </main>

      <Footer />
    </div>
  );
}
