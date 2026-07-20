// src/components/Footer.tsx

import { Trophy, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-slate-100 bg-[#f8faf9] dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#064E3B]/10 p-2 text-[#064E3B] dark:bg-emerald-400/10 dark:text-emerald-400">
                <Trophy className="h-5 w-5" />
              </span>

              <div>
                <h3
                  className="font-headline text-xl font-black text-[#064E3B] dark:text-white"
                  style={{ margin: 0 }}
                >
                  Elite Turf Registry
                </h3>

                <p
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                  style={{ margin: "2px 0 0 0" }}
                >
                  Horse Racing Management Platform
                </p>
              </div>
            </div>

            <p
              className="max-w-md text-sm text-slate-600 dark:text-slate-400"
              style={{ margin: "16px 0 0 0" }}
            >
              Centralized platform for tournament management, race operations,
              horse registration, jockey coordination, and spectator engagement.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4
              className="text-sm font-black uppercase tracking-wider text-[#064E3B] dark:text-slate-200"
              style={{ margin: "0 0 16px 0" }}
            >
              Platform
            </h4>

            <ul
              className="text-sm text-slate-600 dark:text-slate-400"
              style={{ listStyleType: "none", padding: 0, margin: 0 }}
            >
              <li
                className="flex items-center gap-2"
                style={{ margin: "0 0 12px 0" }}
              >
                <ShieldCheck className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                Tournament Administration
              </li>

              <li
                className="flex items-center gap-2"
                style={{ margin: "0 0 12px 0" }}
              >
                <ShieldCheck className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                Horse Registry Management
              </li>

              <li
                className="flex items-center gap-2"
                style={{ margin: "0 0 12px 0" }}
              >
                <ShieldCheck className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                Race Scheduling
              </li>

              <li className="flex items-center gap-2" style={{ margin: 0 }}>
                <ShieldCheck className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                Prediction & Reward System
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm font-black uppercase tracking-wider text-[#064E3B] dark:text-slate-200"
              style={{ margin: "0 0 16px 0" }}
            >
              Contact
            </h4>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div
                className="flex items-center gap-2"
                style={{ margin: "0 0 12px 0" }}
              >
                <Mail className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                support@eliteturfregistry.com
              </div>

              <div className="flex items-center gap-2" style={{ margin: 0 }}>
                <MapPin className="h-4 w-4 text-[#064E3B] dark:text-emerald-500" />
                Ho Chi Minh City, Vietnam
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-t border-slate-200 dark:border-slate-800/60 pt-4"
          style={{ margin: "32px 0 0 0", borderTopWidth: "1px" }}
        >
          <div className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© {year} Elite Turf Registry. All rights reserved.</p>

            <div className="flex items-center gap-4">
              <button className="transition hover:text-[#064E3B] dark:hover:text-emerald-400 bg-transparent border-0 p-0 text-slate-500 dark:text-slate-400 cursor-pointer">
                Privacy Policy
              </button>

              <button className="transition hover:text-[#064E3B] dark:hover:text-emerald-400 bg-transparent border-0 p-0 text-slate-500 dark:text-slate-400 cursor-pointer">
                Terms of Service
              </button>

              <button className="transition hover:text-[#064E3B] dark:hover:text-emerald-400 bg-transparent border-0 p-0 text-slate-500 dark:text-slate-400 cursor-pointer">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
