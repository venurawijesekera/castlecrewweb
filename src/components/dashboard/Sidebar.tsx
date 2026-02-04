"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("castle_token");
                const res = await fetch("/api/card", {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data: any = await res.json();
                    setUser(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUser();
    }, []);

    const isActive = (path: string) => {
        // Exact match or sub-path match logic
        return pathname === path || pathname.startsWith(path + "/");
    };

    const navItemClass = (path: string, colorClass: string = "text-slate-600 hover:text-slate-900 hover:bg-slate-100") => {
        return `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive(path) ? "bg-[#f00000] text-white shadow-lg shadow-red-200" : colorClass}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("castle_token");
        document.cookie = "castle_token=; Max-Age=0; path=/;";
        window.location.href = "/";
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-8 z-20 h-screen sticky top-0">
            <div>
                <div className="flex items-center gap-2 mb-12 text-xl font-black tracking-tight text-slate-900 italic">
                    <div className="w-3.5 h-3.5 bg-[#f00000] rotate-45 rounded-sm"></div> CASTLE CREW
                </div>
                <nav className="space-y-1.5 text-slate-500">

                    {(user?.role === 'admin' || user?.role === 'super_admin') ? (
                        <>
                            <Link href="/enterprise/dashboard" className={navItemClass("/enterprise/dashboard")}>
                                <i className="bi bi-speedometer2"></i> Dashboard
                            </Link>
                            <Link href="/enterprise/admins" className={navItemClass("/enterprise/admins")}>
                                <i className="bi bi-shield-check"></i> Admins
                            </Link>
                            <Link href="/enterprise/staff" className={navItemClass("/enterprise/staff")}>
                                <i className="bi bi-people"></i> Staff Members
                            </Link>
                            <Link href="/enterprise/products" className={navItemClass("/enterprise/products")}>
                                <i className="bi bi-card-checklist"></i> Products
                            </Link>
                            <Link href="/enterprise/analytics" className={navItemClass("/enterprise/analytics")}>
                                <i className="bi bi-graph-up-arrow"></i> Analytics
                            </Link>

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 mb-3 px-2">Management</p>
                            <Link href="/enterprise/settings" className={navItemClass("/enterprise/settings")}>
                                <i className="bi bi-sliders"></i> Company Settings
                            </Link>
                            <Link href="/enterprise/requests" className={navItemClass("/enterprise/requests")}>
                                <i className="bi bi-inbox"></i> Open Requests
                            </Link>
                            <Link href="/profile" className={navItemClass("/profile")}>
                                <i className="bi bi-person"></i> My Profile
                            </Link>

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 mb-3 px-2">Tools</p>
                            <Link href="/enterprise/messages" className={navItemClass("/enterprise/messages")}>
                                <i className="bi bi-chat-left-text"></i> Messages
                            </Link>
                            <Link href="/enterprise/qr" className={navItemClass("/enterprise/qr")}>
                                <i className="bi bi-qr-code-scan"></i> Generate QR
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={navItemClass("/")}>
                                <i className="bi bi-grid-1x2"></i> Home Page
                            </Link>

                            <Link href="/profile" className={navItemClass("/profile")}>
                                <i className="bi bi-person-circle"></i> Profile
                            </Link>

                            {(user?.role !== 'admin' && user?.role !== 'super_admin' && user?.enterprise_id) && (
                                <Link href="/profile?view=products" className={navItemClass("/profile?view=products")}>
                                    <i className="bi bi-box-seam"></i> Products
                                </Link>
                            )}

                            <Link href="/product-leads" className={navItemClass("/product-leads")}>
                                <i className="bi bi-envelope-paper"></i> Product Leads
                            </Link>

                            <Link href="/leads" className={navItemClass("/leads")}>
                                <i className="bi bi-person-lines-fill"></i> Connections
                            </Link>

                            <Link href="/dashboard" className={navItemClass("/dashboard")}>
                                <i className="bi bi-layout-text-window"></i> Templates
                            </Link>

                            <Link href="/analytics" className={navItemClass("/analytics")}>
                                <i className="bi bi-bar-chart"></i> Analytics
                            </Link>

                            <Link href="/settings" className={navItemClass("/settings")}>
                                <i className="bi bi-gear"></i> Settings
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-900 border border-slate-100">
                        {user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || "Loading..."}</p>
                        <p className="text-[10px] text-[#f00000] font-black uppercase tracking-tight">{user?.plan || "..."} Role</p>
                    </div>
                </div>

                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 text-xs font-bold uppercase transition-all">
                    <i className="bi bi-box-arrow-left"></i> Sign Out
                </button>
            </div>
        </aside>
    );
}
