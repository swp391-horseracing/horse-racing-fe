import React from "react";

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border p-5 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between border-b pb-2.5 mb-4">
          <h3 className="font-bold text-base text-[#064E3B]">
            Add Horse to Roster
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <input
              required
              name="name"
              type="text"
              className="col-span-2 bg-slate-50 border rounded-md p-2 text-xs"
              placeholder="Horse Name"
            />
            <select
              required
              name="breed"
              className="bg-slate-50 border rounded-md p-2 text-xs"
            >
              <option value="Thoroughbred">Thoroughbred</option>
              <option value="Arabian">Arabian</option>
              <option value="Quarter Horse">Quarter Horse</option>
            </select>
            <select
              required
              name="gender"
              className="bg-slate-50 border rounded-md p-2 text-xs"
            >
              <option value="Stallion">Stallion</option>
              <option value="Mare">Mare</option>
              <option value="Gelding">Gelding</option>
            </select>
            <input
              required
              name="dob"
              type="date"
              className="bg-slate-50 border rounded-md p-2 text-xs"
            />
            <input
              required
              name="associationCode"
              type="text"
              className="col-span-2 bg-slate-50 border rounded-md p-2 text-xs"
              placeholder="Association Code"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
