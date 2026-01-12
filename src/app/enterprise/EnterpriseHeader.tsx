"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function EnterpriseHeader() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("castle_token");
        localStorage.removeItem("castle_user_id");
        localStorage.removeItem("castle_enterprise_id");
        document.cookie = "castle_token=; Max-Age=0; path=/;";
        router.push("/login");
    };

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <button className="md:hidden text-gray-500 text-xl">
                    <i className="bi bi-list"></i>
                </button>
                <div className="hidden md:block w-full max-w-sm">
                    <div className="relative">
                        <i className="bi bi-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search anything (Name, ID, Product)..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20 group">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition">?</div>
                    <div className="text-left">
                        <p className="text-[9px] font-black uppercase opacity-70 leading-none">Need Help?</p>
                        <p className="text-[10px] font-bold leading-none">Contact Support</p>
                    </div>
                </button>

                <div className="relative">
                    <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition relative">
                        <i className="bi bi-bell-fill"></i>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-100 mx-2"></div>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition text-left">
                        <div className="w-10 h-10 rounded-full bg-[#f00000] overflow-hidden flex items-center justify-center text-white border-2 border-white shadow-sm">
                            <i className="bi bi-person-fill"></i>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-black text-gray-900 leading-none mb-1">Super Admin</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">System Admin</p>
                        </div>
                        <i className={`bi bi-chevron-down text-gray-400 text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                <p className="text-xs font-black text-gray-900">Manage Account</p>
                                <p className="text-[10px] text-gray-400">test@testcorp.com</p>
                            </div>

                            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition" onClick={() => setDropdownOpen(false)}>
                                <i className="bi bi-grid-fill"></i> My Profile Dashboard
                            </Link>
                            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition" onClick={() => setDropdownOpen(false)}>
                                <i className="bi bi-person-circle"></i> Visit My Profile
                            </Link>
                            <Link href="/profile?edit=true" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition" onClick={() => setDropdownOpen(false)}>
                                <i className="bi bi-pencil-square"></i> Edit Profile Card
                            </Link>

                            <div className="h-px bg-gray-50 my-2"></div>

                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition text-left">
                                <i className="bi bi-box-arrow-right"></i> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
