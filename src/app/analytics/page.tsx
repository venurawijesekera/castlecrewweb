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
        <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-7xl mx-auto h-full">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase text-white mb-1">Card <span className="text-[#f00000]">Analytics</span></h1>
                    <p className="text-gray-400 text-sm">Performance metrics for your digital profile.</p>
                </div>
                <button onClick={loadStats} className="text-xs bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-white transition flex items-center gap-2">
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Views"
                    value={loading ? "..." : stats.visits}
                    desc="Unique page loads"
                    icon="bi-eye"
                    color="blue"
                />
                <StatCard
                    label="Saves"
                    value={loading ? "..." : stats.saves}
                    desc='"Save Contact" clicks'
                    icon="bi-person-plus"
                    color="green"
                />
                <StatCard
                    label="Exchanged"
                    value={loading ? "..." : stats.exchanges}
                    desc="Leads collected"
                    icon="bi-arrow-left-right"
                    color="purple"
                />
                <StatCard
                    label="Calls"
                    value={loading ? "..." : stats.calls}
                    desc="Clicks on phone numbers"
                    icon="bi-telephone"
                    color="red"
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, desc, icon, color }: any) {
    const colors: any = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'bg-blue-500/5' },
        green: { bg: 'bg-green-500/10', text: 'text-green-500', glow: 'bg-green-500/5' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'bg-purple-500/5' },
        red: { bg: 'bg-[#f00000]/10', text: 'text-[#f00000]', glow: 'bg-red-500/5' }
    };

    const theme = colors[color] || colors.blue;

    return (
        <div className="bg-[#121212] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${theme.glow} rounded-full blur-xl group-hover:bg-opacity-20 transition`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center text-xl`}>
                    <i className={`bi ${icon}`}></i>
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">{label}</span>
            </div>
            <h2 className="text-4xl font-black text-white relative z-10">{value}</h2>
            <p className="text-xs text-gray-500 mt-2 relative z-10">{desc}</p>
        </div>
    );
}
