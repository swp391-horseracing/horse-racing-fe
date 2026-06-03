import React from "react";
import UserLayout from "../layouts/UserLayout"; // Adjust path as needed

export default function AdminPage() {
    return (
        <UserLayout>
            <div className="p-6 space-y-4 max-w-7xl mx-auto font-body h-full overflow-y-auto">
                <div className="border-b border-[#064E3B]/10 pb-4">
                    <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">System Control Panel</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Audit operational configurations, update database systems, and monitor security protocols.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold font-headline text-[#064E3B] mb-2 text-md">User Account Profiles</h3>
                        <p className="text-xs text-slate-600 font-medium">Review and assign system role clearances for Jockey, Owner, and Spectator entities.</p>
                    </div>
                    <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold font-headline text-[#064E3B] mb-2 text-md">Access Control & Logs</h3>
                        <p className="text-xs text-slate-600 font-medium">Review compliance events and security flags across standard APIs.</p>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
