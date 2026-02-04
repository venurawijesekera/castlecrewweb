"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ visits: 0, saves: 0, exchanges: 0, calls: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        const token = localStorage.getItem('castle_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/analytics/stats', { headers: { 'Authorization': token } });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data: any = await res.json();
            if (data.error) throw new Error(data.error);

            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [router]);

    return (
        <div className="p-8 md:p-16 pb-32 md:pb-16 max-w-6xl mx-auto min-h-full text-slate-900 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f00000]/10 text-[#f00000] text-[10px] font-black uppercase tracking-widest border border-[#f00000]/20">
                        data & growth
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic">
                        Card <span className="text-[#f00000]">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md">
                        In-depth metrics tracking your digital presence and engagement across the Castle Crew network.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={loadStats} className="bg-white text-slate-900 font-black uppercase py-4 px-8 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-[10px] tracking-widest italic flex items-center gap-2">
                        <i className="bi bi-arrow-clockwise text-sm"></i> Sync Data
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-48 text-slate-300">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-[#f00000] rounded-full animate-spin mb-6"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest italic tracking-[0.2em]">Calculating metrics...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard
                        label="Profile Reach"
                        value={stats.visits}
                        desc="Unique card views"
                        icon="bi-eye"
                        trend="Total Impressions"
                    />
                    <StatCard
                        label="Identity Saves"
                        value={stats.saves}
                        desc="VCF contact downloads"
                        icon="bi-person-check"
                        trend="Conversion Rate"
                    />
                    <StatCard
                        label="Network Growth"
                        value={stats.exchanges}
                        desc="Leads gathered"
                        icon="bi-at"
                        trend="Active Interest"
                    />
                    <StatCard
                        label="Direct Action"
                        value={stats.calls}
                        desc="Phone/Social clicks"
                        icon="bi-telephone-outbound"
                        trend="Click-throughs"
                    />
                </div>
            )}

            {/* Insight Section */}
            {!loading && (
                <div className="mt-16 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f00000]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                            <i className="bi bi-lightning-charge-fill text-[#f00000]"></i> Performance Summary
                        </h3>
                        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                            Your digital identity is currently seen by <span className="text-slate-900 font-bold">{stats.visits}</span> unique individuals.
                            With <span className="text-[#f00000] font-bold">{stats.exchanges}</span> leads collected, your profile is converting at a rate of
                            <span className="text-slate-900 font-bold ml-1">
                                {stats.visits > 0 ? ((stats.exchanges / stats.visits) * 100).toFixed(1) : "0"}%
                            </span>.
                            Keep sharing your card to scale these numbers.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, desc, icon, trend }: any) {
    return (
        <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 group flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#f00000]/5 transition-colors"></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#f00000] group-hover:text-white transition-all group-hover:rotate-6">
                    <i className={`bi ${icon} text-xl`}></i>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{label}</span>
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none mb-2">{value}</h2>
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{desc}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1 h-1 rounded-full bg-[#f00000]"></div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
