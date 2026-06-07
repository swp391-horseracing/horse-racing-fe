// src/components/Footer.tsx

import { Trophy, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-[#064E3B]/10 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#064E3B]/10 p-2 text-[#064E3B]">
                <Trophy className="h-5 w-5" />
              </span>

              <div>
                <h3 className="font-headline text-xl font-black text-[#064E3B]">
                  Elite Turf Registry
                </h3>

                <p className="text-xs font-semibold text-slate-500">
                  Horse Racing Management Platform
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm text-slate-600">
              Centralized platform for tournament management, race operations,
              horse registration, jockey coordination, and spectator engagement.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-[#064E3B]">
              Platform
            </h4>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#064E3B]" />
                Tournament Administration
              </li>

              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#064E3B]" />
                Horse Registry Management
              </li>

              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#064E3B]" />
                Race Scheduling
              </li>

              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#064E3B]" />
                Prediction & Reward System
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-[#064E3B]">
              Contact
            </h4>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#064E3B]" />
                support@eliteturfregistry.com
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#064E3B]" />
                Ho Chi Minh City, Vietnam
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© {year} Elite Turf Registry. All rights reserved.</p>

            <div className="flex items-center gap-4">
              <button className="transition hover:text-[#064E3B]">
                Privacy Policy
              </button>

              <button className="transition hover:text-[#064E3B]">
                Terms of Service
              </button>

              <button className="transition hover:text-[#064E3B]">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
