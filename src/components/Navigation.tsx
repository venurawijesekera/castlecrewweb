"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 100) {
                if (currentScrollY > lastScrollY) {
                    setIsHidden(true);
                } else {
                    setIsHidden(false);
                }
            } else {
                setIsHidden(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("castle_token");
            if (token) {
                try {
                    // Note: API routes need to be migrated for this to work fully.
                    // For now, checks if token exists. function implementation pending.
                    // Fetch user data logic will go here.
                    // const res = await fetch("/api/card", { headers: { Authorization: token } });
                    // const data = await res.json();
                    // if (data.avatar_url) setUserAvatar(data.avatar_url);
                } catch (e) {
                    console.error("Auth check failed", e);
                }
                // Placeholder for logged in state if no avatar
                // setUserAvatar("default"); 
            }
        };
        checkAuth();
    }, [pathname]);

    return (
        <nav
            id="main-nav"
            className={`w-full py-8 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md transition-transform duration-300 ${isHidden ? "-translate-y-full" : "translate-y-0"
                }`}
        >
            <Link
                href="/"
                className="text-2xl font-black tracking-tighter flex items-center gap-2"
            >
                <div className="w-3 h-3 bg-[#f00000] rotate-45"></div>
                CASTLE CREW
            </Link>

            <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                <Link href="/" className="hover:text-white transition">
                    Home
                </Link>
                <Link href="/cards" className="hover:text-white transition">
                    Smart Cards
                </Link>
                <Link href="/#sculpt-me" className="hover:text-white transition text-[#f00000]">
                    Sculpt Me
                </Link>
                <Link href="/#packaging" className="hover:text-white transition">
                    Packaging
                </Link>
                <Link href="/#signage" className="hover:text-white transition">
                    Signage
                </Link>
                <Link href="/#merch" className="hover:text-white transition">
                    Merch
                </Link>
            </div>

            <div id="auth-nav">
                {userAvatar ? (
                    <Link href="/profile" className="profile-icon w-10 h-10 flex items-center justify-center bg-white text-black rounded-full overflow-hidden hover:bg-[#f00000] hover:text-white transition">
                        {userAvatar !== "default" ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : <i className="bi bi-person-fill"></i>}
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="text-xs font-bold border-b border-white pb-1 hover:text-[#f00000] hover:border-[#f00000] transition"
                    >
                        CLIENT LOGIN
                    </Link>
                )}
            </div>
        </nav>
    );
}
