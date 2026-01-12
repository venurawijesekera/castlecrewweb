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
                const token = localStorage.getItem("castle_token");
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/enterprise/dashboard', {
                    headers: {
                        'Authorization': token
                    }
                });
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
                <button onClick={() => setView('admins')} className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider ${view === 'admins' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Admins</button>
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
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                License Status: Active
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon="bi-award" title="Profile Licenses" value={`${stats.active_staff_count}/${company.license_count}`} sub="Active / Total" color="text-gray-900" />
                        <StatCard icon="bi-qr-code-scan" title="Sub Licenses" value={`${stats.assigned_sub_licenses}/${company.sub_license_count}`} sub="Used / Total" color="text-gray-900" />
                        <StatCard icon="bi-people" title="Active Staff" value={stats.active_staff_count} sub="Profiles Live" color="text-gray-900" />
                        <StatCard icon="bi-check-circle" title="Active Products" value={stats.product_card_count} sub="Cards Live" color="text-gray-900" />
                    </div>

                    {/* Delegated Admins Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900">Delegated Admins</h3>
                                    <p className="text-xs text-gray-400">Manage admin access and permissions.</p>
                                </div>
                                <button onClick={() => setView('admins')} className="text-xs font-bold text-gray-500 hover:text-black">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="p-4 pl-6">Admin User</th>
                                            <th className="p-4">Digital Card</th>
                                            <th className="p-4">Staff Managed</th>
                                            <th className="p-4 text-right pr-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {/* Filter out super_admin from this list if desired, API returns all admins */}
                                        {data.admins.filter((a: any) => a.id !== viewer.id).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400 text-xs">No delegated admins found.</td></tr>}
                                        {data.admins.filter((a: any) => a.id !== viewer.id).map((admin: any) => (
                                            <tr key={admin.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                                            {admin.avatar_url ? <img src={admin.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{admin.name.charAt(0)}</div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900">{admin.name}</p>
                                                            <p className="text-[10px] text-gray-500">{admin.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {admin.slug ? (
                                                        <a href={`/${admin.slug}`} target="_blank" className="text-blue-500 text-xs font-bold hover:underline">/{admin.slug}</a>
                                                    ) : <span className="text-xs text-gray-400">N/A</span>}
                                                </td>
                                                <td className="p-4 text-xs font-bold text-gray-600">{admin.staff_managed} Users</td>
                                                <td className="p-4 text-right pr-6">
                                                    <button className="text-gray-400 hover:text-gray-900"><i className="bi bi-three-dots-vertical"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Enterprise Actions */}
                        <div className="space-y-6">
                            <div className="bg-[#0a0a0a] rounded-3xl p-8 text-white text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f00000] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-12 h-12 mb-4 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400 text-xl animate-pulse"><i className="bi bi-lightning-fill"></i></div>
                                    <h3 className="font-bold text-lg mb-2">Enterprise Actions</h3>
                                    <p className="text-gray-400 text-xs mb-8">Quickly manage your enterprise settings and preferences.</p>

                                    <div className="space-y-3 w-full">
                                        <button className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wide hover:bg-gray-100 transition">Edit Company Details</button>
                                        <button className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wide hover:bg-gray-700 hover:text-white transition">Create New Account</button>
                                    </div>
                                </div>
                            </div>
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
                </div>
            )}

            {view === 'admins' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Enterprise Admins</h2>
                            <p className="text-gray-500 text-sm">Manage all administrators in your enterprise.</p>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-gray-800 transition">
                            <i className="bi bi-plus-lg"></i> Add New Admin
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.admins.map((admin: any) => (
                            <div key={admin.id} className="bg-[#0f0f0f] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#f00000] to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                                <div className="w-16 h-16 rounded-full border-2 border-[#f00000] p-1 mb-4 overflow-hidden relative">
                                    {admin.avatar_url ? <img src={admin.avatar_url} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">{admin.name.charAt(0)}</div>}
                                </div>
                                <h3 className="font-bold text-white mb-1">{admin.name}</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Delegated Admin</p>
                                <p className="text-xs text-gray-600 mb-6 font-mono">ID: {admin.id}</p>

                                <button className="w-full bg-gray-800 text-gray-300 font-bold py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-700 hover:text-white transition">View Profile</button>
                            </div>
                        ))}
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
