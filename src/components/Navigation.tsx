"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";

export default function Navigation() {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
    const pathname = usePathname();

    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
        return `transition font-bold ${isActive ? "text-[#f00000]" : "hover:text-white"}`;
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("castle_token");
            if (token) {
                try {
                    const res = await fetch("/api/card", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data: any = await res.json();
                        setUserRole(data.role || 'staff');
                        if (data.avatar_url) {
                            setUserAvatar(data.avatar_url);
                        } else {
                            setUserAvatar("default");
                        }
                    } else if (res.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem("castle_token");
                        setUserAvatar(null);
                        setUserRole(null);
                    }
                } catch (e) {
                    console.error("Auth check failed", e);
                }
            } else {
                setUserAvatar(null);
                setUserRole(null);
            }
        };
        checkAuth();
    }, [pathname]);

    const getProfileLink = () => {
        if (userRole === 'admin' || userRole === 'super_admin') {
            return "/enterprise/dashboard";
        }
        // If they are a master admin (not enterprise admin), they might use /admin
        // But role usually comes as 'super_admin' for enterprise. 
        // Let's check if they have enterprise_id.
        return "/profile";
    };

    return (
        <>
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

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white text-2xl"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open Menu"
                >
                    <i className="bi bi-list"></i>
                </button>

                <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Link href="/" className={getLinkClass("/")}>
                        Home
                    </Link>
                    <Link href="/cards" className={getLinkClass("/cards")}>
                        Smart Cards
                    </Link>
                    <Link href="/sculptme" className={getLinkClass("/sculptme")}>
                        Sculpt Me
                    </Link>
                    <Link href="/shop" className={getLinkClass("/shop")}>
                        Shop
                    </Link>
                    <Link href="/services" className={getLinkClass("/services")}>
                        Services
                    </Link>
                    <Link href="/about" className={getLinkClass("/about")}>
                        About
                    </Link>
                    <Link href="/contact" className={getLinkClass("/contact")}>
                        Contact Us
                    </Link>
                </div>

                <div id="auth-nav" className="hidden md:block">
                    {userAvatar ? (
                        <Link href={getProfileLink()} className="profile-icon w-10 h-10 flex items-center justify-center bg-gray-100 text-black rounded-full overflow-hidden hover:ring-2 hover:ring-[#f00000] transition">
                            {userAvatar !== "default" ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : <i className="bi bi-person-fill text-lg"></i>}
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
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                userAvatar={userAvatar}
                userRole={userRole}
            />
        </>
    );
}
