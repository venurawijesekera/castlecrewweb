"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Quick client-side check or fetch user data
        // Ideally this should come from a Context or Layout fetch
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/card");
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

    const navItemClass = (path: string, colorClass: string = "text-gray-400 hover:text-white hover:bg-gray-800") => {
        return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive(path) ? "bg-[#f00000]/10 text-[#f00000] font-bold" : colorClass}`;
    };

    const handleLogout = () => {
        // Clear legacy storage too
        localStorage.removeItem("castle_token");
        // Call Logout API if we implement one to clear cookie
        // For now just redirect
        document.cookie = "session_token=; Max-Age=0; path=/;";
        window.location.href = "/";
    };

    return (
        <aside className="w-64 bg-[#0f0f0f] border-r border-gray-900 hidden md:flex flex-col justify-between p-6 z-20 h-screen sticky top-0">
            <div>
                <div className="flex items-center gap-2 mb-10 text-xl font-bold tracking-tight text-white">
                    <div className="w-3 h-3 bg-[#f00000] rotate-45"></div> CASTLE CREW
                </div>
                <nav className="space-y-2">

                    {(user?.role === 'admin' || user?.role === 'super_admin') ? (
                        <>
                            <Link href="/enterprise/dashboard" className={navItemClass("/enterprise/dashboard")}>
                                <i className="bi bi-speedometer"></i> Dashboard
                            </Link>
                            <Link href="/enterprise/admins" className={navItemClass("/enterprise/admins")}>
                                <i className="bi bi-shield-lock-fill"></i> Admins
                            </Link>
                            <Link href="/enterprise/staff" className={navItemClass("/enterprise/staff")}>
                                <i className="bi bi-people-fill"></i> Staff Members
                            </Link>
                            <Link href="/enterprise/products" className={navItemClass("/enterprise/products")}>
                                <i className="bi bi-box-seam-fill"></i> Products
                            </Link>
                            <Link href="/enterprise/analytics" className={navItemClass("/enterprise/analytics")}>
                                <i className="bi bi-bar-chart-fill"></i> Analytics
                            </Link>

                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6 mb-2 px-2">Settings</p>
                            <Link href="/enterprise/settings" className={navItemClass("/enterprise/settings")}>
                                <i className="bi bi-gear-fill"></i> Company Settings
                            </Link>
                            <Link href="/enterprise/requests" className={navItemClass("/enterprise/requests")}>
                                <i className="bi bi-inbox-fill"></i> Open Requests
                            </Link>
                            <Link href="/profile" className={navItemClass("/profile")}>
                                <i className="bi bi-person-circle"></i> My Profile
                            </Link>

                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6 mb-2 px-2">Tools</p>
                            <Link href="/enterprise/messages" className={navItemClass("/enterprise/messages")}>
                                <i className="bi bi-chat-dots-fill"></i> Message
                            </Link>
                            <Link href="/enterprise/qr" className={navItemClass("/enterprise/qr")}>
                                <i className="bi bi-qr-code"></i> Generate QR
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={navItemClass("/")}>
                                <i className="bi bi-house-door-fill"></i> Home Page
                            </Link>

                            <Link href="/profile" className={navItemClass("/profile")}>
                                <i className="bi bi-person-circle"></i> Profile
                            </Link>

                            {/* Enterprise Logic for Products link visibility can be added here */}
                            {(user?.role !== 'admin' && user?.role !== 'super_admin' && user?.enterprise_id) && (
                                <Link href="/profile?view=products" className={navItemClass("/profile?view=products")}>
                                    <i className="bi bi-box-seam-fill"></i> Products
                                </Link>
                            )}

                            {/* Pending Pages */}
                            <Link href="/product-leads" className={navItemClass("/product-leads")}>
                                <i className="bi bi-inboxes-fill"></i> Product Leads
                            </Link>

                            <Link href="/leads" className={navItemClass("/leads")}>
                                <i className="bi bi-people-fill"></i> Connections
                            </Link>

                            <Link href="/dashboard" className={navItemClass("/dashboard")}>
                                <i className="bi bi-grid-fill"></i> Templates
                            </Link>

                            <Link href="/analytics" className={navItemClass("/analytics")}>
                                <i className="bi bi-bar-chart-fill"></i> Analytics
                            </Link>

                            <Link href="/settings" className={navItemClass("/settings")}>
                                <i className="bi bi-gear-fill"></i> Settings
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-800">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">👤</div>
                <div>
                    <p className="text-sm font-bold text-white">{user?.full_name || "Loading..."}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{user?.plan || "..."} Role</p>
                </div>
            </div>
            <div className="mt-4">
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-bold uppercase">
                    <i className="bi bi-box-arrow-left"></i> Sign Out
                </button>
            </div>
        </aside>
    );
}
