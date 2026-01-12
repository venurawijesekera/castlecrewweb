"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import EnterpriseHeader from "./EnterpriseHeader";

export default function EnterpriseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const view = searchParams.get('view') || 'dashboard';

    useEffect(() => {
        // Quick check for auth token, detailed check happens in page
        const token = localStorage.getItem("castle_token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f3f4f6] text-sm font-sans text-gray-900">
            {/* Sidebar */}
            <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col z-20 fixed md:relative h-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center text-white">
                            <img src="/assets/img/logo.png" className="w-5 h-5" alt="Logo" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Castle<span className="text-[#f00000]">Crew</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>

                    <Link href="/enterprise/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/dashboard' && view === 'dashboard' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <i className="bi bi-grid-1x2-fill"></i>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/enterprise/dashboard?view=admins" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/dashboard' && view === 'admins' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <i className="bi bi-shield-lock"></i>
                        <span className="font-medium">Admins</span>
                    </Link>
                    <Link href="/enterprise/dashboard?view=staff" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/dashboard' && view === 'staff' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <i className="bi bi-people"></i>
                        <span className="font-medium">Staff Members</span>
                    </Link>
                    <Link href="/enterprise/dashboard?view=products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/dashboard' && view === 'products' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <i className="bi bi-qr-code-scan"></i>
                        <span className="font-medium">Products</span>
                    </Link>
                    <Link href="/enterprise/dashboard?view=analytics" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/dashboard' && view === 'analytics' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <i className="bi bi-bar-chart-line"></i>
                        <span className="font-medium">Analytics</span>
                    </Link>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Settings</p>
                        <Link href="/enterprise/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/settings' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <i className="bi bi-gear"></i>
                            <span className="font-medium">Company Settings</span>
                        </Link>
                        <Link href="/enterprise/requests" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/requests' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <i className="bi bi-inbox"></i>
                            <span className="font-medium">Open Requests</span>
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                            <i className="bi bi-person-circle"></i>
                            <span className="font-medium">My Profile</span>
                        </Link>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tools</p>
                        <Link href="/enterprise/messages" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/messages' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <i className="bi bi-chat-dots"></i>
                            <span className="font-medium">Message</span>
                        </Link>
                        <Link href="/enterprise/qr" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/qr' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <i className="bi bi-qr-code"></i>
                            <span className="font-medium">Generate QR</span>
                        </Link>
                        <Link href="/enterprise/auth" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/enterprise/auth' ? 'bg-[#0a0a0a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <i className="bi bi-shield-check"></i>
                            <span className="font-medium">Authenticator</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 group cursor-pointer hover:bg-gray-100 transition">
                        <div className="w-8 h-8 rounded-full bg-[#f00000] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-md group-hover:scale-110 transition">
                            SA
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">Super Admin</p>
                            <p className="text-[10px] text-gray-400 truncate">Enterprise Mode</p>
                        </div>
                        <button onClick={() => {
                            localStorage.removeItem('castle_token');
                            router.push('/login');
                        }} className="text-gray-400 hover:text-gray-600">
                            <i className="bi bi-box-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 md:hidden"></div>}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <EnterpriseHeader />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
