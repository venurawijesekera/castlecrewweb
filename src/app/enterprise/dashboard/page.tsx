"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EnterpriseDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dashboard'); // dashboard, staff, products

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/api/enterprise/dashboard');
                if (!res.ok) {
                    if (res.status === 401) router.push('/login');
                    return;
                }
                const json: any = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    if (loading) return <div className="p-10 text-gray-500">Loading Enterprise Data...</div>;
    if (!data) return <div className="p-10 text-red-500">Failed to load data.</div>;

    const { stats, company, viewer, logs, staff, unassigned_cards } = data;

    return (
        <div className="space-y-8">
            {/* Tabs / Sub-Nav for now to match legacy single-page feel */}
            <div className="flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
                <button onClick={() => setView('dashboard')} className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider ${view === 'dashboard' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Dashboard</button>
                <button onClick={() => setView('staff')} className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider ${view === 'staff' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Staff ({stats.managed_staff_count})</button>
                <button onClick={() => setView('products')} className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider ${view === 'products' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Products ({stats.product_card_count})</button>
            </div>

            {view === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">
                                Welcome back, {viewer.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-gray-500 font-medium">Manage your enterprise at <span className="font-bold text-black">{company.name}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setView('staff')} className="bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center gap-2">
                                <i className="bi bi-person-plus-fill"></i>
                                <span>Invite Staff</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon="bi-people-fill" title="Total Staff" value={stats.active_staff_count} sub="Active Profiles" color="text-gray-900" />
                        <StatCard icon="bi-qr-code" title="Active Products" value={stats.product_card_count} sub="Cards Live" color="text-gray-900" />
                        <StatCard icon="bi-award-fill" title="License Usage" value={`${stats.assigned_sub_licenses}/${company.sub_license_count}`} sub={`${((stats.assigned_sub_licenses / company.sub_license_count) * 100).toFixed(0)}% Used`} color="text-gray-900" />
                        <StatCard icon="bi-eye-fill" title="Total Views" value={stats.total_views} sub="Global Engagement" color="text-gray-900" />
                    </div>

                    {/* Recent Activity Logs */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-gray-50">
                                    {logs.length === 0 && <tr><td className="p-4 text-center text-gray-400 text-xs">No recent activity.</td></tr>}
                                    {logs.map((log: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${log.type === 'new_staff' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                        <i className={`bi ${log.type === 'new_staff' ? 'bi-person-plus' : 'bi-qr-code'}`}></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{log.title}</p>
                                                        <p className="text-[10px] text-gray-500">{log.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-gray-600">{log.target_name}</td>
                                            <td className="p-4 text-[10px] text-gray-400 text-right">{new Date(log.timestamp).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {view === 'staff' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Staff Members</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {staff.map((u: any) => (
                            <div key={u.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 mb-4 overflow-hidden">
                                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{u.name.substring(0, 2)}</div>}
                                </div>
                                <h3 className="font-bold text-gray-900">{u.name}</h3>
                                <p className="text-xs text-gray-500 mb-4">{u.email}</p>
                                <div className="mt-auto flex gap-2 w-full">
                                    <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 text-xs font-bold py-2 rounded-lg transition">Manage</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'products' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Filter staff to find cards that are NOT main profiles, or just show list if logic simplifies */}
                        {/* For simplicity showing all staff with cards for now, essentially duplicates staff view but focused on cards */}
                        {staff.filter((s: any) => s.slug).map((u: any) => (
                            <div key={u.card_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-gray-900 truncate pr-4">{u.name}'s Card</h3>
                                    <a href={`/${u.slug}`} target="_blank" className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 hover:text-black">↗</a>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 font-mono">/{u.slug}</p>
                            </div>
                        ))}
                        {staff.filter((s: any) => s.slug).length === 0 && <div className="col-span-full text-center text-gray-400">No products found.</div>}
                    </div>
                </div>
            )}

        </div>
    );
}

function StatCard({ icon, title, value, sub, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <i className={`bi ${icon} text-6xl`}></i>
            </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">{sub}</span>
                </div>
            </div>
        </div>
    );
}
