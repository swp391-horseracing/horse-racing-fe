import React from "react";
import { Calendar, FileText, Dumbbell, Heart, Sparkles } from "lucide-react";

interface AddHorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AddHorseModal({
  isOpen,
  onClose,
  onSubmit,
}: AddHorseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0b634c] p-6 text-white relative">
          <div className="absolute right-6 top-6 bg-white/10 rounded-full p-1.5 backdrop-blur-xs text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3
            className="font-bold text-lg font-headline !text-white"
            style={{ color: "#ffffff" }}
          >
            Register New Horse
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            Add a new pedigree horse to your stable registry.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horse Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#064E3B]" /> Horse Name *
              </label>
              <input
                required
                name="name"
                type="text"
                maxLength={255}
                placeholder="e.g. Thunder Blaze"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>

            {/* Breed */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#064E3B]" /> Breed *
              </label>
              <select
                required
                name="breed"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              >
                <option value="Thoroughbred">Thoroughbred</option>
                <option value="Arabian">Arabian</option>
                <option value="Quarter Horse">Quarter Horse</option>
                <option value="Standardbred">Standardbred</option>
                <option value="Appaloosa">Appaloosa</option>
              </select>
            </div>

            {/* Birth Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#064E3B]" /> Birth Date *
              </label>
              <input
                required
                name="birth_date"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>

            {/* Weight (Kg) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#064E3B]" /> Weight (kg)
                *
              </label>
              <input
                required
                name="weight_kg"
                type="number"
                step="0.01"
                min="1.00"
                max="9999.99"
                placeholder="e.g. 450.50"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>

            {/* Health Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#064E3B]" /> Health Status *
              </label>
              <select
                required
                name="health_status"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              >
                <option value="Healthy">Healthy (Optimal)</option>
                <option value="Resting">Resting / Off-season</option>
                <option value="Injured">Injured (Under recovery)</option>
                <option value="Sick">Sick (Under Treatment)</option>
              </select>
            </div>

            {/* Status (Default Hidden / Managed internally on registration) */}
            <input type="hidden" name="status" value="active" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-655 hover:bg-slate-50 active:scale-95 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#064E3B] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#043E2F] active:scale-95 transition duration-200 shadow-md shadow-[#064E3B]/10"
            >
              Register Horse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
